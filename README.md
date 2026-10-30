# Atelier

A free art-learning platform covering drawing fundamentals through digital art, concept art, and professional production. The curriculum is organized into learning arcs with lesson-level prerequisites, practice tasks, quizzes, and a searchable reference index.

## Course status

The curriculum contains **123 authored lesson records** across 11 arcs. **114 lessons across 10 arcs are in live arcs**; the **Professional Production & Specializations** arc contains 9 authored lessons but remains marked `soon`. Three later arcs are roadmap placeholders without lesson records yet: Portfolio & Personal Branding, Freelancing & Business, and Professional Careers & Lifelong Growth.

## Offline Ask a Doubt

The doubt assistant uses a curated bilingual knowledge file (`doubt-knowledge.js`) with **75 prepared answer topics**, keyword and phrase matching, plus retrieval from `curriculum-index.json` to suggest relevant lessons. It runs entirely in the browser: no API key, account, cloud proxy, model download, or server setup is required. It is a bounded knowledge assistant, not a generative AI model; when it cannot confidently match a question, it says so and suggests relevant course lessons rather than inventing an answer.

## Structure

- `index.html` — app shell
- `styles.css` — styling
- `app.js` — rendering, navigation, learning state, search, offline doubt assistant, and floating video player
- `doubt-knowledge.js` — curated bilingual question/answer knowledge base and matching keywords
- `curriculum-1.js` through `curriculum-4.js` — lesson and arc data
- `translations-hi.js` — Hinglish translations for all 123 authored lesson records
- `curriculum-index.json` — searchable lesson and reference chunks
- `notes-data.js` — lesson notes and reference data

## Run locally

Serve this directory as static files and open `index.html`. Browser storage is used for local learning progress, preferences, and doubt history.
