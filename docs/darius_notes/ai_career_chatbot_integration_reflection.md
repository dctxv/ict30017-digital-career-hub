# AI Career Chatbot Integration Reflection

| Field   | Value                        |
| ------- | ---------------------------- |
| Project | P83 Digital Career Hub       |
| Author  | Darius Clay Tan Yi (AI Lead) |
| Feature | AI Career Chatbot            |
| Area    | Backend AI service, Express route, React widget |

---

## Why This Note Exists

I wanted to document this feature while the reasoning is still fresh, because the chatbot integration was not only a coding task. It involved several architecture decisions around security, user access, streaming, prompt control, token limits, and what should be kept simple for this sprint.

The final result is a working AI Career Chatbot that uses the same AI provider setup as the Resume Reviewer, streams responses to the frontend, and can currently be used without signing in. Some parts are deliberately temporary, especially guest access and the disabled daily turn limit, because the project still does not have the full production auth flow wired through the frontend.

---

## What Was Made

### 1. Chatbot AI Service

I added a dedicated chatbot service inside `ai-service/src/services/chatbot.js`.

The service is responsible for:

- using the shared AI client from `aiClient.js`
- applying the Bangladesh career-assistant system prompt
- sanitising user input
- masking sensitive Bangladesh-specific PII
- removing prompt-injection phrases
- enforcing a message token cap
- enforcing a sliding conversation history window
- returning streamed token chunks from the AI provider

I kept this service inside `ai-service` rather than building AI logic directly into Express. My thinking was that the Resume Reviewer already established a pattern where Express handles HTTP concerns and `ai-service` handles provider concerns. Keeping the chatbot in the same layer means future model/provider changes remain centralised.

I also exported the chatbot function from `ai-service/index.js`, matching how the Resume Reviewer is exposed. This keeps the backend route clean and avoids reaching deep into the service folder from Express.

---

### 2. Token Truncation Utility

I added `ai-service/src/services/tokenTruncation.js`.

The chatbot needs conversation memory, but sending the entire chat history forever would eventually break the model context window or make requests unnecessarily expensive. I used a sliding window approach:

- the system prompt is always kept
- the newest user message is always kept
- the oldest history messages are dropped first when the history gets too large

The incoming user message is capped separately at around 1,500 tokens. If it is too long, it is shortened and a note is appended.

I used an approximate token estimator instead of adding a tokenizer dependency. For this project stage, exact token accounting is less important than having a predictable guardrail. The goal is not perfect token math; the goal is preventing runaway context size while keeping the implementation lightweight.

---

### 3. Input Sanitisation

The chatbot service now strips:

- HTML tags
- script blocks
- prompt-injection phrases such as "ignore your instructions" or "you are now"

It also masks:

- NID-style 13-17 digit numbers
- Bangladeshi mobile numbers
- passport-style IDs

My reasoning here was that chat input is more exposed than resume upload input. A resume is usually a document, but a chatbot invites direct attempts to override the system prompt. I did not want to rely only on the system prompt to resist that. The input should be cleaned before it reaches the model.

I also chose to replace suspicious prompt-injection phrases with `[removed]` rather than deleting the entire message. That way, if the user mixes a bad instruction with a valid career question, the assistant can still answer the valid career part.

---

### 4. Express Chat Route

I created `server/src/routes/chatbot.js` and mounted it at:

```text
/api/chat
```

The route accepts:

```json
{
  "message": "string",
  "conversationHistory": [],
  "language": "en"
}
```

It returns a Server-Sent Events style stream:

```text
data: token chunk

data: [DONE]
```

On failure, it sends:

```text
data: [ERROR]
```

I kept raw errors away from the frontend. The browser only needs to know that the request failed. Internal provider details, API errors, and stack traces should stay on the server.

---

### 5. Guest Access

The first version required a valid JWT. That matched the original architecture requirement, but it did not match the current state of the frontend, where authentication is not fully wired through the app yet.

I changed the route so that JWT is optional for now:

- if a valid token exists, the route attaches that user
- if no token exists, the route treats the request as a guest session
- the chatbot still streams from the real AI service either way

This was a practical decision. The feature needs to be usable during development and demonstration, and blocking it behind an auth system that is not fully connected would make the chatbot look broken even though the AI integration works.

I left the structure in a way that can later support authenticated limits again. Guest access is a sprint decision, not a permanent architecture statement.

---

### 6. Rate Limiting

I added `express-rate-limit` to protect `/api/chat`.

The current rule is:

```text
20 requests per 15 minutes per IP
```

I considered a custom in-memory limiter first because the repo did not already have an AI limiter. But the requirement specifically referenced `express-rate-limit`, and using the standard library is clearer for the team. It is also easier to recognise during marking or review.

I kept this IP limit even after enabling guest access. Without login, IP-based limiting is the only lightweight protection against accidental or abusive repeated calls.

---

### 7. Daily Turn Tracking Migration

I added:

```text
server/migrations/add_chat_turn_tracking.sql
```

It adds:

- `chat_message_count`
- `chat_count_reset_date`

The migration is not run automatically. That is intentional. Database schema changes should be applied deliberately, not silently on server startup.

At first, the backend route enforced the free-tier daily limit against these columns. After guest access was requested, I disabled the daily tier limit in the active route. My reasoning was simple: if the chatbot is meant to work without login, then a user-table counter cannot be the active gate. It can come back later when auth is stable.

---

### 8. React Chatbot Widget

I replaced the previous mock chatbot with a real streaming widget in:

```text
client/src/components/ChatbotWidget.jsx
```

The widget now:

- keeps conversation history in React state
- sends the previous history with each request
- streams assistant tokens in real time
- shows a typing indicator
- disables send while the assistant is responding
- handles `[DONE]` and `[ERROR]`
- does not use localStorage
- does not require sign-in

I used `fetch()` with a `ReadableStream` reader instead of `EventSource`. This was necessary because the chatbot endpoint is a `POST` request with a JSON body. `EventSource` is designed for `GET`, so it would not fit this API shape without awkward workarounds.

---

### 9. Scoped Widget Styling

I added:

```text
client/src/components/ChatbotWidget.module.css
```

I chose a CSS module instead of editing global CSS because the widget appears on every page. A floating global component can easily leak styles or accidentally inherit layout rules from unrelated pages. Keeping styles scoped makes the component safer to drop into the root app.

The older `ChatbotWidget.css` file still exists, but the active widget now imports the module file.

---

### 10. Vite API Proxy

I updated `client/vite.config.js` so `/api` requests proxy to the Express server in development.

This lets the widget call:

```text
/api/chat
```

instead of hardcoding:

```text
http://localhost:3000/api/chat
```

That matters because relative API paths are easier to deploy later. The frontend should not have to know the backend host in production.

---

## Things Considered But Not Used

### Redis Conversation Storage

I did not use Redis for chatbot memory.

The architecture document mentions Redis as a future production option, but this sprint only needs stateless history. The frontend keeps the conversation array in memory and sends it with each request.

I chose this because Redis would add infrastructure, configuration, and operational complexity before the basic chatbot workflow was proven. It is better to prove the UX and AI behaviour first, then move session memory server-side later if needed.

---

### localStorage Conversation History

I did not store chat history in `localStorage`.

This was both a requirement and a privacy decision. Career conversations can include personal details, job concerns, education history, and sensitive identifiers. Keeping the history only in React state means it disappears on refresh and is not written permanently into the browser.

For a career platform, that is a safer default.

---

### EventSource

I did not use `EventSource`.

`EventSource` is convenient for SSE, but it only supports `GET` cleanly. The chatbot needs to send a message, history array, and language value in the request body, so `fetch()` with a stream reader is the better fit.

This made the frontend code slightly more manual because I had to parse `data:` frames myself. But the API design is cleaner.

---

### A New AI Client

I did not create a separate AI client for the chatbot.

The Resume Reviewer already uses a shared OpenAI-compatible client pointing at the configured provider. Adding a second client would duplicate model configuration and make it easier for the two AI features to drift apart.

The better design is one provider client, multiple feature services.

---

### New Environment Variables

I did not add new AI environment variables.

The server already has the provider key and model settings needed by the AI client. Adding chatbot-specific keys would make local setup harder and increase the chance that one feature works while another fails.

The chatbot should use the same dev/testing AI provider as the Resume Reviewer.

---

### Fully Blocking Guest Users

The original version blocked users without JWT.

That is technically cleaner for production, but it was not the right choice for the current project state. The frontend login flow is mostly presentational, and there is no complete shared auth context yet. If I kept the hard auth requirement, the chatbot would be integrated but not practically usable.

So I changed the route to optional auth. This lets the feature be demonstrated now while still allowing authenticated behaviour later.

---

### Enforcing Daily User Limits Right Now

I built the migration and the SQL logic for daily free-user limits, but I did not keep the daily user limit active after enabling guest access.

The reason is that daily limits depend on a real user row. A guest user does not have one. I could have built a guest counter by IP, but that would be a different rule from the original user-table requirement.

For now, the active limit is the IP rate limit. Once auth is actually connected, the daily user limit can be re-enabled.

---

### Reworking the Navbar Language Toggle

I did not rebuild the language system.

The current `Navbar` keeps language in local component state. There is no global language context yet. I considered creating one, but that would touch more of the app than the chatbot task required.

Instead, the widget reads the current visible language toggle from the page and sends `en` or `bn` in the request body. This is not my ideal long-term design, but it is a small, low-risk bridge until the app has a real language provider.

---

### Changing the Resume Reviewer

I did not touch the Resume Reviewer service or route.

That was intentional because it is already working and tested. The chatbot needed to follow its patterns, not destabilise it. Any shared improvements should be made only after the chatbot has its own baseline working.

---

## Testing Notes

I checked the following:

- frontend build passes
- frontend lint passes
- chatbot route passes Node syntax check
- unauthenticated `/api/chat` request returns an SSE stream instead of `401`
- live AI provider smoke test streams real response tokens
- blank API-key test returns a clean `[ERROR]` frame rather than exposing provider details
- prompt-injection sanitisation replaces suspicious override text
- Bangladesh mobile/NID-style PII is redacted before reaching the model

One important observation: the model may still produce advice that reflects older Bangladeshi resume conventions, such as suggesting a photo. That is a prompt-quality issue, not an integration issue. The integration works, but the chatbot prompt may need the same kind of iterative testing that the Resume Reviewer prompt went through.

---

## Current State

The chatbot is now usable from the frontend without sign-in.

The active flow is:

1. User opens floating widget.
2. User sends a career question.
3. Frontend sends message, history, and language to `/api/chat`.
4. Express validates the body and applies IP rate limiting.
5. Backend builds the model message list with sanitised history.
6. AI provider streams token chunks.
7. Frontend appends those chunks into the assistant message in real time.

This is the right version for demonstration and development. The production version should later restore authenticated daily limits, replace the temporary language detection with a real context, and test the chatbot prompt more deeply against off-topic and Bangladesh-specific career scenarios.
