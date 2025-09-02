# Product Hunt Agent (Demo)

A small Mastra-based agent + static UI that can:

- Fetch top 3 Product Hunt products for any given day.
- Search products using the Product Hunt Algolia index.
- Answer questions about launching on Product Hunt.
- Launch confetti on the front end.
- Host a dummy Product Hunt–style page on GitHub Pages and embed the agent there.

This folder contains:

- `src/` — Agent, tools, a lightweight server (`src/server.ts`).
- `web/` — Static site that looks like a PH page, with a chat widget and confetti.

## Quick Start (local)

Prereqs: Node 20+.

1. Install deps:

   - If needed, run `npm install` in the repo root.

2. Build the server code:

   - `npm run build:server`

3. Start the API server:

   - `npm run serve`
   - It listens on `http://localhost:8787`.

4. Open the static UI:

   - Open `web/index.html` in your browser (or serve `web/` with any static server).
   - The UI calls the local API by default.

## Environment Variables

For real data (otherwise the app uses safe demo mocks or public search creds):

- `PRODUCTHUNT_API_TOKEN` — Bearer token for Product Hunt GraphQL v2 (`https://api.producthunt.com/v2/api/graphql`).
- Algolia Search for Product Hunt
   - By default, the app uses the public Product Hunt Algolia credentials from the PH wiki:
      - Application ID: `0H4SMABBSG`
      - Search-Only API Key: `9670d2d619b9d07859448d7628eea5f3`
      - Index Name: `Post_production` (falls back to `Posts_production` if empty)
   - You can override via env vars:
      - `ALGOLIA_APP_ID`
      - `ALGOLIA_SEARCH_API_KEY`
      - `ALGOLIA_INDEX_NAME`
- `OPENAI_API_KEY` — For the agent’s Q&A about launching.

You can add these to your `.env` (not committed) and export in your shell before running the server.

## API

- `GET /api/top?date=YYYY-MM-DD` → `{ posts: PHPost[], date }`
- `GET /api/search?q=term` → `{ hits: Hit[], q }`
- `POST /api/chat` → `{ reply: string }` with JSON body `{ message: string }`

CORS is enabled for demo usage.

## GitHub Pages Hosting

- Push the `web/` directory to your public repo and enable GitHub Pages (source: `/(root)` or `/docs`, or an action). If you use `web/` as Pages root, set that in the repo settings.
- In `web/index.html`, set `window.PH_AGENT_API` to your deployed API server URL (Render/Vercel/Fly/etc.). Example:

   ```html
   <script>
      window.PH_AGENT_API = 'https://your-api.example.com';
   </script>
   ```

- The page includes a chat widget with a Product Hunt–style icon, and a Launch button that fires confetti.

## Notes

- Without API keys, the UI still works with mock data to demonstrate flow.
- The chat agent uses OpenAI via `@ai-sdk/openai` and Mastra’s Agent. Provide `OPENAI_API_KEY` for real answers.
- This is a minimal demo; harden auth, rate limits, and error handling before production.

## Scripts

- `npm run build:server` — TS → `dist/` for the server.
- `npm run serve` — Start the server at `:8787`.
- `npm run dev` / `npm run start` — Mastra CLI (if you prefer Mastra’s workflow).

## Make it Public

This app is self-contained. Make the repo public (or copy this folder to a new public repo) to share the source code.

