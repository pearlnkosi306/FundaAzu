import { configurationError, isConfigured, supabase } from "./supabase";

export type ChatMsg = { role: "user" | "assistant"; content: string; styleLabel?: string | null };

export interface StudyBuddyOptions {
  firstName: string;
  languageName: string;
  modeLabel: string;
  variantLabel?: string;
  visuals: boolean;
  visualTheme: string;
  sceneGuidance?: string;
}

interface StreamChunk {
  choices?: Array<{ delta?: { content?: string } }>;
  error?: { message?: string };
}

function deploymentCommand(): string {
  const projectRef = new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split(".")[0];
  return `npx supabase login\nnpx supabase functions deploy study-buddy --project-ref ${projectRef}`;
}

async function responseError(response: Response): Promise<string> {
  const body = await response.text();
  if (body) {
    try {
      const payload = JSON.parse(body) as {
        message?: string;
        error?: string | { message?: string };
      };
      const message = typeof payload.error === "string"
        ? payload.error
        : payload.error?.message ?? payload.message;
      if (message) return message;
    } catch {
      return body;
    }
  }
  return `The study service returned HTTP ${response.status}.`;
}

export async function streamStudyBuddy(
  messages: ChatMsg[],
  preferences: StudyBuddyOptions,
  onToken: (token: string) => void,
  signal: AbortSignal
): Promise<string> {
  if (!isConfigured) throw new Error(configurationError());
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (!session) throw new Error("Your sign-in has expired. Please sign in again.");

  let response: Response;
  try {
    response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-buddy`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY,
      "Accept": "text/event-stream",
    },
    body: JSON.stringify({ messages: messages.map(({ role, content }) => ({ role, content })), preferences }),
    });
  } catch (failure) {
    if (failure instanceof Error && failure.name === "AbortError") throw failure;
    throw new Error(
      `The Supabase study-buddy function is not reachable. The deployment or CORS preflight is failing. In PowerShell, deploy it to this app's project:\n${deploymentCommand()}`
    );
  }
  if (!response.ok) {
    const detail = await responseError(response);
    if (response.status === 404) {
      throw new Error(`The Supabase study-buddy function was not found in this project. In PowerShell, deploy it with:\n${deploymentCommand()}`);
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Supabase rejected the chat request: ${detail}. Sign out and sign in again, and check the Edge Function JWT configuration.`);
    }
    throw new Error(detail);
  }
  if (!response.body) throw new Error("The study service returned an empty response.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  let fullResponse = "";
  let finished = false;
  const consumeLine = (line: string) => {
    if (!line.startsWith("data:")) return;
    const payload = line.slice(5).trim();
    if (!payload) return;
    if (payload === "[DONE]") {
      finished = true;
      return;
    }
    let chunk: StreamChunk;
    try {
      chunk = JSON.parse(payload) as StreamChunk;
    } catch {
      throw new Error("The study service returned an invalid streaming response.");
    }
    if (chunk.error?.message) throw new Error(chunk.error.message);
    const token = chunk.choices?.[0]?.delta?.content;
    if (token) {
      fullResponse += token;
      onToken(token);
    }
  };
  try {
    while (!finished) {
      const { value, done } = await reader.read();
      if (done) {
        pending += decoder.decode();
        if (pending) consumeLine(pending);
        break;
      }
      pending += decoder.decode(value, { stream: true });
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() ?? "";
      for (const line of lines) consumeLine(line);
    }
    if (!fullResponse.trim()) throw new Error("The AI service finished without returning an answer. Check its model and API-key settings.");
    return fullResponse;
  } finally {
    reader.releaseLock();
  }
}
