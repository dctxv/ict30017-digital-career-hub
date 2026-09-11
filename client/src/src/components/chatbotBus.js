/**
 * Opening the chatbot from somewhere that is not the chatbot.
 *
 * The widget is mounted once at the app root and is not routed, so a caller —
 * the home page tile, the "ask the chatbot" button on a results page — has no
 * component instance to reach for. This is a one-event bus: the caller
 * dispatches, the mounted widget listens.
 *
 * It is a bus rather than a provider because open-ness is the only thing anyone
 * outside the widget needs to influence, and a context for one boolean would
 * put a re-render on the whole tree every time a message streamed in.
 *
 * It lives in its own module so ChatbotWidget.jsx exports nothing but its
 * component, which is what keeps fast refresh working on that file.
 */

export const CHATBOT_OPEN_EVENT = 'chatbot:open'

/** Opens the chatbot from anywhere in the app. */
export function openChatbot() {
  window.dispatchEvent(new CustomEvent(CHATBOT_OPEN_EVENT))
}
