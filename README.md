# Atelier

A free art-learning platform covering drawing fundamentals through digital art, concept art, and professional production. The curriculum is organized into learning arcs with lesson-level prerequisites, practice tasks, quizzes, and a searchable reference index.

## Course status

The curriculum contains **123 authored lesson records** across 11 arcs. **114 lessons across 10 arcs are in live arcs**; the **Professional Production & Specializations** arc contains 9 authored lessons but remains marked `soon`. Three later arcs are roadmap placeholders without lesson records yet: Portfolio & Personal Branding, Freelancing & Business, and Professional Careers & Lifelong Growth.

Live arcs:
- Foundations (7 lessons)
- Perspective & Construction (7)
- Head & Portrait (16)
- Body & Anatomy (17)
- Nature & Architecture (19)
- Creatures & Hard Surface (10)
- World Building & Concept Art (10)
- Digital Art Fundamentals (8)
- Digital Painting & Rendering (10)
- Advanced Digital Art (10)

Planned arc:
- Professional Production & Specializations (9 authored lessons; currently marked `soon`)

Roadmap placeholders (lesson content not yet authored):
- Portfolio & Personal Branding
- Freelancing & Business
- Professional Careers & Lifelong Growth

## Structure

- `index.html` — app shell
- `styles.css` — styling
- `app.js` — rendering, navigation, learning state, search, doubt assistant, and floating video player
- `curriculum-1.js` through `curriculum-4.js` — lesson and arc data
- `translations-hi.js` — Hinglish translations for all 123 authored lesson records
- `curriculum-index.json` — searchable lesson and reference chunks
- `config.js` — public, non-secret configuration
- `cloudflare-worker/worker.js` — optional secure Gemini proxy; requires separate deployment and secret configuration

## Run locally

Serve this directory as static files and open `index.html`. Browser storage is used for local learning progress and preferences.

## Optional cloud AI setup

The browser must never contain a Gemini API key. To enable the cloud "Ask a doubt" option, deploy `cloudflare-worker/worker.js`, add `GEMINI_API_KEY` as a Cloudflare Worker secret, and set `geminiProxyUrl` in `config.js` to the HTTPS Worker URL. Until this is configured, the on-device option remains available. Configure Cloudflare rate limiting; CORS is not authentication.
