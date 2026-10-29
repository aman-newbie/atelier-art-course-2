// Atelier Gemini proxy. Set GEMINI_API_KEY as a Cloudflare Worker secret; never commit it.
const ALLOWED_ORIGINS = new Set([
  'https://aman-newbie.github.io'
]);
const MAX_BODY_BYTES = 32 * 1024;
const MAX_HISTORY_ITEMS = 10;
const MAX_TEXT_CHARS = 12000;
const DEFAULT_MODEL = 'gemini-3.6-flash';

function headersFor(origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (ALLOWED_ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}
function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), {status, headers});
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = headersFor(origin);
    if (request.method === 'OPTIONS') {
      if (!ALLOWED_ORIGINS.has(origin)) return jsonResponse({error:{message:'Forbidden origin'}},403,headers);
      return new Response(null,{status:204,headers});
    }
    if (!ALLOWED_ORIGINS.has(origin)) return jsonResponse({error:{message:'Forbidden origin'}},403,headers);
    if (request.method !== 'POST') return jsonResponse({error:{message:'Method not allowed'}},405,headers);
    if (!env || !env.GEMINI_API_KEY) return jsonResponse({error:{message:'Cloud AI service is not configured'}},503,headers);
    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > MAX_BODY_BYTES) return jsonResponse({error:{message:'Request body is too large'}},413,headers);
    let raw;
    try { raw = await request.text(); } catch (_) { return jsonResponse({error:{message:'Could not read request body'}},400,headers); }
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return jsonResponse({error:{message:'Request body is too large'}},413,headers);
    let body;
    try { body = JSON.parse(raw); } catch (_) { return jsonResponse({error:{message:'Invalid JSON body'}},400,headers); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonResponse({error:{message:'Invalid request body'}},400,headers);
    const contents = body.contents;
    if (!Array.isArray(contents) || contents.length < 1 || contents.length > MAX_HISTORY_ITEMS) return jsonResponse({error:{message:'Invalid conversation history'}},400,headers);
    for (const item of contents) {
      if (!item || !['user','model'].includes(item.role) || !Array.isArray(item.parts) || item.parts.length < 1 || item.parts.length > 8) return jsonResponse({error:{message:'Invalid conversation item'}},400,headers);
      for (const part of item.parts) {
        if (!part || typeof part.text !== 'string' || !part.text.trim() || part.text.length > MAX_TEXT_CHARS) return jsonResponse({error:{message:'Invalid message text'}},400,headers);
      }
    }
    const cfg = body.config && typeof body.config === 'object' && !Array.isArray(body.config) ? body.config : {};
    const systemInstruction = typeof cfg.systemInstruction === 'string' ? cfg.systemInstruction.slice(0,MAX_TEXT_CHARS) : '';
    const maxOutputTokens = Number.isFinite(cfg.maxOutputTokens) ? Math.max(64,Math.min(800,Math.floor(cfg.maxOutputTokens))) : 400;
    const temperature = Number.isFinite(cfg.temperature) ? Math.max(0,Math.min(1, Number(cfg.temperature))) : 0.6;
    // Do not accept arbitrary model names from the browser.
    const model = DEFAULT_MODEL;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
    const payload = {contents, generationConfig:{maxOutputTokens,temperature}};
    if (systemInstruction) payload.systemInstruction = {parts:[{text:systemInstruction}]};
    let upstream;
    try {
      upstream = await fetch(geminiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    } catch (_) {
      return jsonResponse({error:{message:'Upstream AI service is unavailable'}},502,headers);
    }
    const text = await upstream.text();
    if (text.length > 100000) return jsonResponse({error:{message:'Upstream response was too large'}},502,headers);
    let data;
    try { data = JSON.parse(text); } catch (_) { return jsonResponse({error:{message:'Invalid response from upstream AI service'}},502,headers); }
    if (!upstream.ok) {
      const status = upstream.status === 429 ? 429 : 502;
      return jsonResponse({error:{message:upstream.status === 429 ? 'AI rate limit reached. Try again shortly.' : 'AI request failed. Check Worker configuration and provider key.'}},status,headers);
    }
    return jsonResponse(data,200,headers);
  }
};
