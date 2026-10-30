# Atelier

A free art-learning platform covering drawing fundamentals through digital art, concept art, and professional production. The curriculum is organized into learning arcs with lesson-level prerequisites, practice tasks, quizzes, and a searchable reference index.

## Course status

The curriculum contains **123 authored lesson records** across 11 arcs. **114 lessons across 10 arcs are in live arcs**; the **Professional Production & Specializations** arc contains 9 authored lessons but remains marked `soon`. Three later arcs are roadmap placeholders without lesson records yet: Portfolio & Personal Branding, Freelancing & Business, and Professional Careers & Lifelong Growth.

## Atelier Mentor

The chat assistant is named **Atelier Mentor**. It is a deterministic, knowledge-based learning assistant (not a generative AI model) that uses a curated bilingual knowledge file (`doubt-knowledge.js`) with **75 prepared answer topics**, keyword and phrase matching, plus retrieval from `curriculum-index.json` to suggest relevant lessons. It handles greetings, identity questions, thanks and unclear short messages before course retrieval; Wikipedia fallback is reserved for explicit factual questions. The core assistant runs client-side: no API key, account, cloud proxy, model download, or server setup is required. Its optional Wikipedia fallback needs a network connection. It is a bounded knowledge assistant, not a generative AI model; when it cannot confidently match a question, it says so and suggests relevant course lessons rather than inventing an answer.

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

## Regression tests

Run `node training/doubt-solver-regression.js` for the bilingual capability/current-lesson suite and `node training/conversation-routing-regression.js` for greetings, identity, clarification, external-search gating, and send-handler routing.
