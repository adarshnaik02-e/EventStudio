# ⚡ EventForge — AI Event Page Generator

> **Describe it. We'll build it.** Paste unstructured event text → get a stunning, production-ready event webpage instantly.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)

---

## ✨ Features

- **AI-Powered Extraction** — Paste any unstructured event text; the LLM extracts all details and fills in creative, context-aware content for anything missing
- **4 Stunning Themes** — Dark Neon Hackathon, Vibrant Cultural, Sleek Tech Conf, Editorial Minimal
- **Live Countdown Timer** — Real-time animated countdown to the event
- **Dual-Pane Workspace** — Left: text input + JSON editor | Right: live preview with viewport toggle
- **Responsive Preview** — Toggle between Desktop, Tablet (768px), and Mobile (390px) views
- **One-Click HTML Export** — Downloads a fully self-contained `index.html` with all styles, animations, and countdown baked in
- **Copy Embed Code** — Generates a base64-encoded iframe embed snippet
- **JSON Live Sync** — Collapsible JSON editor syncs changes to the preview in real-time
- **Quick-Fill Presets** — Hackathon, Cultural Fest, Tech Conf sample texts

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# (Optional) Add your OpenAI API key for real AI extraction
cp .env.local.example .env.local
# Edit .env.local and add: OPENAI_API_KEY=sk-...

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Without an API key**, the app uses smart rule-based mock data that detects event type (hackathon/cultural/tech) from keywords and generates realistic, complete event pages.

---

## 🎨 Themes

| Theme | Best For | Aesthetic |
|-------|----------|-----------|
| `dark-neon-hackathon` | Hackathons, coding events | Cyberpunk, neon emerald/violet, monospace |
| `vibrant-cultural` | Festivals, cultural events | Warm sunset gradients, amber/rose/purple |
| `sleek-tech-conf` | Conferences, summits | Enterprise dark indigo, crisp cyan |
| `editorial-minimal` | Workshops, academic events | High-contrast monochrome, brutalist |

---

## 📁 Project Structure

```
event-page-generator/
├── app/
│   ├── api/generate/route.ts   # LLM extraction API
│   ├── page.tsx                # Main dual-pane UI
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── EventPageRenderer.tsx   # Full event page renderer
├── lib/
│   ├── types.ts                # TypeScript types + theme configs + presets
│   └── exportHtml.ts           # Self-contained HTML generator
└── specs/
    └── event-page-spec.json    # JSON Schema for event data
```

---

## 🔧 Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **TypeScript 5**
- **OpenAI GPT-4o-mini** (optional, falls back to rule-based mock)

---

## 📦 Deploying

```bash
npm run build
npm run start
```

Or deploy to Vercel — set `OPENAI_API_KEY` as an environment variable in your project settings.
