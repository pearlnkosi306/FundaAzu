# 🌍 AZ-900 AI Study Buddy (Unofficial)

An AI tutor that teaches **Microsoft Azure Fundamentals (AZ-900)** to school learners and beginner engineers across Africa, **in your language and your vibe**.

> Unofficial study aid. Not affiliated with or endorsed by Microsoft. No Microsoft logos and no real exam questions are used. Content follows the public AZ-900 skills outline on Microsoft Learn.

Built for the **#1MillionDevs Vibe Coding Hackathon: AZ-900 Exam Prep Edition**, challenge 🤖 *Support: AI Study Buddy*.

## ✨ Features

| Feature | How it works |
|---|---|
| **Account** | Name, surname, email + password (Supabase Auth). Profile auto-created by a DB trigger. |
| **12 teaching modes** | Textbook (default), Friend, Anime, Film, Gossip, House & rent, Cars, Football, Music, Kitchen, Gaming, and Classic teacher. Each reply uses the selected style as its explanatory frame: for example, Gossip opens with a fictional neighborhood scenario and Cars teaches through a vehicle analogy. The welcome header mirrors the active per-reply mode, variant, and language immediately. Language and variant preferences apply to every reply; an optional example setting can further guide that reply. Media-inspired examples use original characters and situations, not existing franchise characters or scenes. |
| **Response-framing agent** | Every reply—including questions selected from the AZ-900 chapter browser—uses the current mode, variant, language, and visual settings shown in the welcome header. Structured output provides Direct Answer, mode-specific Analogy, separate mode-specific Example, optional Differences when relevant, and Summary sections; a mode-matched Mermaid diagram is included when visuals are enabled. English analogy and example text is checked for mode and variant markers and gets one targeted repair attempt if the selected frame is missing; invalid or still-mismatched output returns an explicit error rather than a generic success-shaped answer. |
| **Friendly error messages** | Technical errors are logged for diagnosis and replaced in the interface with a short “We're working on it” message; raw backend and code errors are not shown to learners. |
| **18 languages** | Swahili, Hausa, Yoruba, Igbo, Nigerian Pidgin, Amharic, isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana, Shona, Kinyarwanda, Somali, Arabic, French, Portuguese, English. Azure terms stay in English (exam-accurate) with local-language explanations. |
| **Localized controls** | Core setup, chat, and accessibility controls update as the learner previews or selects a language; Arabic uses right-to-left page direction. |
| **AZ-900 chapter guide** | Browse the three exam skill areas, their published weighting ranges, and standard practice prompts before asking the tutor. |
| **Tone mirroring** | The system prompt tells the model to match the learner's register and greet them by first name. |
| **Focus music** | A flowing, original 120 BPM piano arpeggio with gentle violin-and-cello-style harmony, generated in-browser and repeated every 15 minutes (offline, copyright-free). |
| **Visuals** | Optional Mermaid diagrams drawn inline in chat. |
| **7 themes** | Savanna, flower garden, Indian Ocean, starry night, rainforest, sunset, and lavender, over an Africa-map watermark and kente stripe. |
| **Accessibility** | Keyboard focus rings, ARIA labels, live regions, reduced-motion support, mobile-first layout, voice input (where the browser supports it), short answers. |
| **Accessibility tools** | Persistent high-legibility font and text-size options, browser read-aloud, high-contrast mode, and a warm eye-comfort palette. |
| **Motion** | Lightweight entrance transitions respect the learner's system reduced-motion preference. |
| **Monitoring** | Optional Sentry error reporting and sampled browser performance tracing; inactive until a project DSN is configured. |
| **Memory** | Chat history is saved per user with Row Level Security. Assistant replies retain a small label for the teaching mode and variant used, so the analogy context remains visible after reload. |

## 🧱 Stack

Vite · React 18 · TypeScript · Tailwind CSS 3 · Motion · Sentry (optional) · Supabase (Auth, Postgres, Edge Functions) · any OpenAI-compatible LLM.

## 🚀 Setup

### 1. Supabase
1. Create a project at <https://supabase.com> (or enable Lovable Cloud).
2. For a new project, run `supabase/migrations/20261020000000_init.sql` in the SQL editor. For an existing project, run the new `supabase/migrations/20261023035221_add_chat_response_style_label.sql` migration to enable persisted reply theme labels.
3. Deploy the function:
   ```bash
   npx supabase login
   npx supabase functions deploy study-buddy --project-ref YOUR_PROJECT_REF
   ```
   Replace `YOUR_PROJECT_REF` with the project reference from your Supabase URL (the part before `.supabase.co`). The chat function must be deployed to the same project as the frontend.
4. Add your OpenAI API key as a Supabase Edge Function secret:
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-...
   ```
   The function now uses only OpenAI's chat completions endpoint and requires `OPENAI_API_KEY`; old `GROQ_API_KEY`, `AI_API_KEY`, `LOVABLE_API_KEY`, and `AI_GATEWAY_URL` settings are ignored. It defaults to `gpt-4o-mini`. To select another model available to your account, set `OPENAI_MODEL`.
   Set these values as **Supabase Edge Function secrets**, not in the frontend `.env`. Keep provider API keys private.
5. Authentication > URL configuration: add your site URL. For fast demos you may turn off "Confirm email".

For local email confirmation, set **Site URL** to `http://localhost:5173` and add these to **Redirect URLs**:

```text
http://localhost:5173/**
http://127.0.0.1:5173/**
```

The signup flow returns to the same origin that opened the signup page. Use the Vite URL (not Live Server on port 5501), and add your deployed domain to Redirect URLs before testing production signup. Confirmation links sent before changing these settings may still point to the old URL; request a fresh confirmation email after fixing the settings.

Run `supabase/migrations/20261020000000_init.sql` once in the Supabase SQL Editor to create the profile/message tables, row-level security policies, and profile-on-signup trigger.

If chat reports **“study-buddy function was not found”** or **“Failed to fetch”**, verify that `study-buddy` appears under **Supabase → Edge Functions**, then deploy it to the project referenced by your frontend URL. A successful frontend build does not deploy the Edge Function. If the function exists but reports that the AI service is not configured, add `OPENAI_API_KEY` under **Supabase → Edge Functions → Secrets**. Secret updates take effect immediately.

If chat reports that OpenAI rejected the request with **HTTP 404**, the function is reachable but the configured model ID or endpoint was not found. Check the models available to your OpenAI account, then set `OPENAI_MODEL` in **Supabase → Edge Functions → Secrets** and retry. Secret updates are available to functions immediately; no redeployment is needed for a secret-only change. Never include API keys in the model setting or frontend environment.

### 2. Frontend
```powershell
Copy-Item .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY; optionally add VITE_SENTRY_DSN
npm install
npm run dev               # open http://localhost:5173; do not use VS Code Live Server
```

Sentry is optional: create a Sentry project for React, then set `VITE_SENTRY_DSN` in your local `.env` and deployment environment to enable browser error reporting and 10% sampled performance traces. Leave it unset to keep monitoring disabled. The DSN is a public project identifier, not an API secret. Do not attach chat prompts, learner profile data, or provider API keys to monitoring events.

Use Deno to validate the Supabase Edge Function locally with `deno check supabase/functions/study-buddy/index.ts`. This checks the function source; deploying it to Supabase remains a separate step.

### Chat performance and diagnosis

- The chat screen is lazy-loaded, and chat-only code is excluded from the initial app load.
- Streamed tokens are painted in small batches, unchanged messages are memoized, and the user-message database write runs alongside the AI request instead of delaying its start.
- Chat history loads the latest 60 messages using the existing `(user_id, created_at)` index.
- Edge Function logs record provider, model, HTTP status, and time to upstream response headers. They intentionally do not record learner prompts or API keys. The successful response includes a `Server-Timing` measurement for the provider's initial response.
- A provider 404 means the Edge Function is reachable but the configured model ID or endpoint is unavailable. Select a current model in the provider console, set it as the `OPENAI_MODEL` Edge Function secret, and retry. Never put provider keys in frontend variables.
- Diagnose with browser Developer Tools (Network/Performance), Supabase Dashboard → Logs → Edge Function, the OpenAI usage/model dashboard, and Sentry once `VITE_SENTRY_DSN` is configured. Measure before adding optimization dependencies.

Recommended development tools: the **Deno** VS Code extension for Edge Function language support, **React Developer Tools** for component profiling, and the built-in browser Developer Tools for network/CPU measurements. These are optional; avoid adding a caching, retry, or telemetry package until measurements identify a need. Automatic retries of chat POSTs can duplicate learner messages or provider charges.

### 3. Deploy
Push to GitHub, then import into Lovable, Vercel, Netlify or Cloudflare Pages. Build command `npm run build`, output `dist`, and set the two `VITE_` variables.

## 🗂️ Structure

```
App.tsx                    screen switching (auth, preferences, chat)
pages/                     Auth, Preferences, Chat
components/                Africa watermark, message bubbles, Mermaid diagrams
hooks/                     Supabase auth/profile and ambient music
lib/                       modes, languages, topics, streaming client, Supabase client
supabase/
  migrations/             tables, RLS, signup trigger
  functions/study-buddy/  prompt builder + streaming AI proxy
```

## 🧠 Tutor response quality

The server-side tutor instructions in `supabase/functions/study-buddy/index.ts` prioritize technical accuracy over role-play. Each request carries the current reply's selected language, teaching mode, sub-style, diagram preference, and interface theme. Textbook is the default for new profiles; saved preferences can be overridden for a reply in the chat composer. Media-inspired modes use original, broad-genre examples rather than existing copyrighted characters or scenes. The Edge Function must be deployed separately from the frontend for chat to work.

## ⚠️ Honest limitations

- Quality in lower-resource languages (e.g. Shona, Kinyarwanda, Setswana) depends on the chosen model. Test with native speakers before relying on it.
- Interface translations and AI-generated explanations are not a substitute for review by fluent speakers, especially for technical or high-stakes learning. Azure product names remain in English to preserve exam terminology.
- "AI-generated" music here is algorithmic and generated in the browser, not from a music model.
- Verify facts on [Microsoft Learn](https://learn.microsoft.com/credentials/certifications/azure-fundamentals/).

## 🗺️ Roadmap
Quiz mode with scoring, flashcards and spaced repetition, study planner by exam date, readiness tracker, text-to-speech, offline PWA, more certifications (AI-900, DP-900, SC-900).

## 📄 Licence
MIT
