# Atelier

A free, verified-resource art education course — structured drawing fundamentals through professional-level skill, one honestly-scoped arc at a time.

## Status

**Course status:** The current curriculum is loaded from four curriculum files; module availability is determined by each module's status in those files.
- Foundations
- Perspective & Construction
- Head & Portrait
- Body & Anatomy

**Mapped, not yet written (10 arcs):** Nature & Architecture, Creatures & Hard Surface, World Building & Concept Art, Digital Art Fundamentals, Digital Painting & Rendering, Advanced Digital Art, Professional Production & Specializations, Portfolio & Personal Branding, Freelancing & Business, Professional Careers & Lifelong Growth.

## Structure

- `index.html` — app shell, links to the files below
- `styles.css` — all styling
- `curriculum-1.js` through `curriculum-4.js` — curriculum data, split across four files
- `app.js` — combines the curriculum parts and holds all app logic (rendering, state, persistence, the floating video player)

Open `index.html` in a browser, or host the folder anywhere that serves static files.

## Workflow note

Changes land on a branch first, get verified, then merge to `main` — nothing goes straight to `main` untested.

## Cloud AI setup (optional)

The browser never stores a Gemini API key. To enable the cloud "Ask a doubt" option, deploy `cloudflare-worker/worker.js`, add `GEMINI_API_KEY` as a Cloudflare Worker secret, and set `geminiProxyUrl` in `config.js` to the HTTPS Worker URL. Until configured, the on-device option remains available. Configure Cloudflare rate limiting for the Worker; CORS is not authentication.
