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
   npm i -g supabase
   supabase login
   supabase link --project-ref YOUR_REF
   supabase functions deploy study-buddy
   ```
4. Set the AI secrets (not needed on Lovable Cloud, which provides `LOVABLE_API_KEY`):
   ```bash
   supabase secrets set AI_API_KEY=sk-... \
     AI_GATEWAY_URL=https://api.openai.com/v1/chat/completions \
     AI_MODEL=gpt-4o-mini
   ```
   Any OpenAI-compatible streaming endpoint works.
5. Authentication > URL configuration: add your site URL. For fast demos you may turn off "Confirm email".

### 2. Frontend
```bash
cp .env.example .env     # add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev              # http://localhost:8080
```

### 3. Deploy
Push to GitHub, then import into Lovable, Vercel, Netlify or Cloudflare Pages. Build command `npm run build`, output `dist`, and set the two `VITE_` variables.

## 🗂️ Structure

```
src/
  App.tsx                 screen switching (auth, preferences, chat)
  pages/                  Auth, Preferences (mode/language/music/visuals/theme), Chat
  components/             Backdrop (Africa watermark + themes), MessageBubble, Mermaid
  hooks/                  useAuth, useAmbientMusic
  lib/                    modes, languages, topics, streaming client, supabase client
supabase/
  migrations/             tables, RLS, signup trigger
  functions/study-buddy/  prompt builder + streaming AI proxy
```

## 🧠 Prompt engineering notes

The system prompt (see `supabase/functions/study-buddy/index.ts`) enforces: analogy first, then an "analogy to Azure" mapping; real African examples (mobile money, minibus taxis, load-shedding, spaza shops); 120-220 words; one check-for-understanding question per reply; honesty about uncertainty and no invented prices or SLAs; own practice questions only; safe, age-appropriate output; prompt-length caps and history trimming on the server.

## ⚠️ Honest limitations

- Quality in lower-resource languages (e.g. Shona, Kinyarwanda, Setswana) depends on the chosen model. Test with native speakers before relying on it.
- "AI-generated" music here is algorithmic and generated in the browser, not from a music model.
- Verify facts on [Microsoft Learn](https://learn.microsoft.com/credentials/certifications/azure-fundamentals/).

## 🗺️ Roadmap
Quiz mode with scoring, flashcards and spaced repetition, study planner by exam date, readiness tracker, text-to-speech, offline PWA, more certifications (AI-900, DP-900, SC-900).

## 📄 Licence
MIT
