# Student and Teacher Chatbot

The homepage chatbot answers public BAUET questions without sign-in and only uses public pages and public catalog records. Student and teacher portal chats verify each Firebase ID token, check the matching active role profile, retrieve pages for that role, and include only that user's approved academic profile fields. The Gemini API key stays on the Node server and is never sent to browser code.

## Run locally

1. Install Node.js 20.19 or newer, or 22.12 or newer.
2. Add your Gemini API key as `GEMINI_API_KEY` in the root `.env.local` file. Keep that file private; it is ignored by Git.
3. Run `npm install`, then `npm run dev`.
4. Open `http://localhost:3000` and sign in through the portal. Alternatively, keep Live Server open on port `5500`; the chatbot sends API requests to the backend on port `3000`.

The Google AI Studio project associated with `GEMINI_API_KEY` must have Gemini generation quota available. A `429` response means that project's request quota or billing limit has been reached; the chatbot will show the closest retrieved website passage when possible, but web-grounded generation needs available quota.

The RAG index is built in memory for each role on its first question. It uses Gemini embeddings over the matching student or teacher pages and shared public pages, then adds the signed-in user's authorized Firebase profile. Current BAUET news and notices are read directly from the official BAUET RSS feeds and Firebase public catalog, so those updates remain available when Gemini generation quota is exhausted. Gemini Google Search grounding can supply other current public facts and citations when quota is available; private profile data is never sent in web searches. The homepage index includes only shared public pages and public catalog records. Student conversations do not retrieve teacher pages, teacher conversations do not retrieve student pages, and chatbot requests cannot query admin pages or another person's private Firebase profile. Answers display with a typing effect and include website/web source links when available.

The public assistant answers common department, registration, sign-in, and location questions directly from the published department catalog or the matching portal pages. Suggested questions are tailored to public, student, and faculty portals. If Gemini quota is exhausted, the assistant only shows a website excerpt when it contains terms relevant to the question; it does not substitute an unrelated page introduction.

`npm run build` continues to build the static Vite site. A deployed chatbot also needs a Node.js server with the same environment variables; a static-only host cannot safely run the Gemini API.
