/* Atelier configuration. Never put provider API keys in browser-delivered files. */
window.ATELIER_CONFIG = {
  // Set this to the deployed Cloudflare Worker URL after deploying cloudflare-worker/worker.js.
  // Keep the Gemini API key only in the Worker secret GEMINI_API_KEY.
  geminiProxyUrl: '',
  geminiModel: 'gemini-3.6-flash'
};
