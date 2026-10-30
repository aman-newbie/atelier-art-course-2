# Atelier

A free art-learning platform covering drawing fundamentals through digital art, concept art, and professional production. The curriculum is organized into learning arcs with lesson-level prerequisites, practice tasks, quizzes, and a searchable reference index.

## Course status

The curriculum contains **123 authored lesson records** across 11 arcs. **114 lessons across 10 arcs are in live arcs**; the **Professional Production & Specializations** arc contains 9 authored lessons but remains marked `soon`. Three later arcs are roadmap placeholders without lesson records yet: Portfolio & Personal Branding, Freelancing & Business, and Professional Careers & Lifelong Growth.

## Atelier Mentor

The chat assistant is named **Atelier Mentor**. It is a deterministic, knowledge-based learning assistant (not a generative AI model) that uses a curated bilingual knowledge file (`doubt-knowledge.js`) with **76 prepared answer topics**, keyword and phrase matching, plus retrieval from `curriculum-index.json` to suggest relevant lessons. It handles greetings, identity questions, thanks and unclear short messages before course retrieval; Wikipedia fallback is reserved for explicit factual questions. The core assistant runs client-side: no API key, account, cloud proxy, model download, or server setup is required. Its optional Wikipedia fallback needs a network connection. It is a bounded knowledge assistant, not a generative AI model; when it cannot confidently match a question, it says so and suggests relevant course lessons rather than inventing an answer.

## Structure

- `index.html` â app shell
- `styles.css` â styling
- `app.js` â rendering, navigation, learning state, search, offline doubt assistant, and floating video player
- `doubt-knowledge.js` â curated bilingual question/answer knowledge base and matching keywords
- `curriculum-1.js` through `curriculum-4.js` â lesson and arc data
- `translations-hi.js` â Hinglish translations for all 123 authored lesson records
- `curriculum-index.json` â searchable lesson and reference chunks
- `notes-data.js` â lesson notes and reference data

## Run locally

Serve this directory as static files and open `index.html`. Browser storage is used for local learning progress, preferences, and doubt history.

## Regression tests

Run `node training/doubt-solver-regression.js` for the bilingual capability/current-lesson suite and `node training/conversation-routing-regression.js` for greetings, identity, clarification, external-search gating, and send-handler routing.
## Atelier Admin Dashboard (local demo)

Open `admin.html` on the same site to reach the separate, read-only Atelier Admin Dashboard. On first use, create a local passphrase of at least 8 characters; it is stored as a salted PBKDF2-SHA-256 hash in this browser. The dashboard includes Overview, Message Library, Intent & Rules, Capabilities, Knowledge Base, Conversation Log, Testing Lab, Diagnostics, and Mentor Q&A.

**Security limitation:** this is a local convenience lock, not secure owner authentication. GitHub Pages serves public static files; the dashboard code and catalogue can be inspected, and browser storage can be modified. Do not enter secrets or reuse an important password. No server-side authentication, protected API, global visitor analytics, or cross-device chat log exists. The Conversation Log can only show the latest 40 records saved in the current browser. The Mentor Q&A is deterministic and reads the local catalogue; it does not call a generative AI service.

Run `node training/admin-dashboard-regression.js` for local passphrase, direct-route access gate, source catalogue integrity, and dashboard-section checks. The admin dashboard is intentionally not linked from the normal course UI.


## Mentor progress and reply language

The Mentor can report progress from the current browser's saved state: completed modules, XP, streak, quiz accuracy, and the next incomplete module. This is local to that browser and does not sync across devices.

The Mentor chat includes a reply-language selector: **Auto**, **English**, **Hindi / Hinglish**, or **Both**. Auto follows the language used in the latest question; an explicit selection takes priority. The selection is saved with the browser's local progress.

The curated knowledge base contains 76 entries and 406 tested aliases, and the tool capability engine covers 19 categories. This is a broad finite coverage set, not a promise to anticipate every possible question or paraphrase. Weak course-search matches are no longer presented as confident answers.

Run `node training/doubt-solver-regression.js`, `node training/conversation-routing-regression.js`, `node training/mentor-progress-language-regression.js`, `node training/knowledge-alias-coverage.js`, `node training/corpus-retrieval-audit.js`, and `node training/admin-dashboard-regression.js` for the regression suites and retrieval benchmark.
