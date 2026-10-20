# 🌍 AZ-900 AI Study Buddy (Unofficial)

An AI tutor that teaches **Microsoft Azure Fundamentals (AZ-900)** to school learners and beginner engineers across Africa, **in your language and your vibe**.

> Unofficial study aid. Not affiliated with or endorsed by Microsoft. No Microsoft logos and no real exam questions are used. Content follows the public AZ-900 skills outline on Microsoft Learn.

Built for the **#1MillionDevs Vibe Coding Hackathon: AZ-900 Exam Prep Edition**, challenge 🤖 *Support: AI Study Buddy*.

## ✨ Features

| Feature | How it works |
|---|---|
| **Account** | Name, surname, email + password (Supabase Auth). Profile auto-created by a DB trigger. |
| **10 teaching modes** | Friend, Anime, Film, Gossip, House & rent, Cars, Football, Music, Kitchen, Gaming, Classic teacher. Anime/Film/Cars/Football/Music/Gaming each have 3 sub-options (e.g. Naruto, Dragon Ball Z, One Piece). |
| **18 languages** | Swahili, Hausa, Yoruba, Igbo, Nigerian Pidgin, Amharic, isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana, Shona, Kinyarwanda, Somali, Arabic, French, Portuguese, English. Azure terms stay in English (exam-accurate) with local-language explanations. |
| **Tone mirroring** | The system prompt tells the model to match the learner's register and greet them by first name. |
| **Focus music** | Calm, vocal-free instrumentals generated live in the browser with the Web Audio API (offline, copyright-free). |
| **Visuals** | Optional Mermaid diagrams drawn inline in chat. |
| **5 themes** | Savanna, flower garden, Indian Ocean, starry night, rainforest, over an Africa-map watermark and kente stripe, with a 4-colour palette (green, gold, terracotta, midnight). |
| **Accessibility** | Keyboard focus rings, ARIA labels, live regions, reduced-motion support, mobile-first layout, voice input (where the browser supports it), short answers. |
| **Memory** | Chat history is saved per user with Row Level Security. |

## 🧱 Stack

Vite · React 18 · TypeScript · Tailwind CSS 3 · Supabase (Auth, Postgres, Edge Functions) · any OpenAI-compatible LLM (Lovable AI gateway by default).

## 🚀 Setup

### 1. Supabase
1. Create a project at <https://supabase.com> (or enable Lovable Cloud).
2. Run `supabase/migrations/20261020000000_init.sql` in the SQL editor.
3. Deploy the function:
   ```bash
   npx supabase login
   npx supabase functions deploy study-buddy --project-ref YOUR_PROJECT_REF
   ```
   Replace `YOUR_PROJECT_REF` with the project reference from your Supabase URL (the part before `.supabase.co`). The chat function must be deployed to the same project as the frontend.
4. Set the AI secrets (not needed on Lovable Cloud, which provides `LOVABLE_API_KEY`):
   ```bash
   supabase secrets set AI_API_KEY=sk-... \
     AI_GATEWAY_URL=https://api.openai.com/v1/chat/completions \
     AI_MODEL=gpt-4o-mini
   ```
   Any OpenAI-compatible streaming endpoint works.
   Set these values as **Supabase Edge Function secrets**, not in the frontend `.env`. Keep provider API keys private.
5. Authentication > URL configuration: add your site URL. For fast demos you may turn off "Confirm email".

For local email confirmation, set **Site URL** to `http://localhost:5173` and add these to **Redirect URLs**:

```text
http://localhost:5173/**
http://127.0.0.1:5173/**
```

The signup flow returns to the same origin that opened the signup page. Use the Vite URL (not Live Server on port 5501), and add your deployed domain to Redirect URLs before testing production signup. Confirmation links sent before changing these settings may still point to the old URL; request a fresh confirmation email after fixing the settings.

Run `supabase/migrations/20261020000000_init.sql` once in the Supabase SQL Editor to create the profile/message tables, row-level security policies, and profile-on-signup trigger.

If chat reports **“study-buddy function was not found”** or **“Failed to fetch”**, verify that `study-buddy` appears under **Supabase → Edge Functions**, then deploy it to the project referenced by your frontend URL. A successful frontend build does not deploy the Edge Function. If the function exists but reports that the AI service is not configured, add `AI_API_KEY` (and optionally `AI_GATEWAY_URL` and `AI_MODEL`) under **Supabase → Edge Functions → Secrets**, then redeploy/retry.

### 2. Frontend
```powershell
Copy-Item .env.example .env
# Edit .env and add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev               # open http://localhost:5173; do not use VS Code Live Server
```

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

The server-side tutor instructions in `supabase/functions/study-buddy/index.ts` prioritize technical accuracy over role-play. Answers follow the learner's selected language, explain official Azure terminology, use the selected teaching mode only for presentation, and provide detailed definitions, mechanisms, examples, and AZ-900 distinctions for substantive questions. The tutor must disclose uncertainty and avoid inventing current pricing, quotas, SLAs, citations, or product behavior. The Edge Function must be deployed separately from the frontend for chat to work.

## ⚠️ Honest limitations

- Quality in lower-resource languages (e.g. Shona, Kinyarwanda, Setswana) depends on the chosen model. Test with native speakers before relying on it.
- "AI-generated" music here is algorithmic and generated in the browser, not from a music model.
- Verify facts on [Microsoft Learn](https://learn.microsoft.com/credentials/certifications/azure-fundamentals/).

## 🗺️ Roadmap
Quiz mode with scoring, flashcards and spaced repetition, study planner by exam date, readiness tracker, text-to-speech, offline PWA, more certifications (AI-900, DP-900, SC-900).

## 📄 Licence
MIT
