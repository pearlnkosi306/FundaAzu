import { configurationError, isConfigured, supabase } from "./supabase";

export type ChatMsg = { role: "user" | "assistant"; content: string };

export interface StudyBuddyOptions {
  firstName: string;
  languageName: string;
  modeLabel: string;
  variantLabel?: string;
  modeStyle: string;
  visuals: boolean;
}

interface StreamChunk {
  choices?: Array<{ delta?: { content?: string } }>;
  error?: { message?: string };
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

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-buddy`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY,
      "Accept": "text/event-stream",
    },
    body: JSON.stringify({ messages, preferences }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `The study service returned HTTP ${response.status}.`);
  }
  if (!response.body) throw new Error("The study service returned an empty response.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  let fullResponse = "";
  let finished = false;
  try {
    while (!finished) {
      const { value, done } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") {
          finished = true;
          break;
        }
        const chunk = JSON.parse(payload) as StreamChunk;
        if (chunk.error?.message) throw new Error(chunk.error.message);
        const token = chunk.choices?.[0]?.delta?.content;
        if (token) {
          fullResponse += token;
          onToken(token);
        }
      }
    }
    return fullResponse;
  } finally {
    reader.releaseLock();
  }
}
