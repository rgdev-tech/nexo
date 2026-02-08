/**
 * Proxy HTTPS → HTTP para usar Xtream en Expo Go (solo desarrollo).
 * Despliega en Cloudflare Workers (gratis): https://workers.cloudflare.com
 *
 * Uso desde la app:
 *   GET ?url=https://...  → devuelve la respuesta de esa URL (API JSON)
 *   GET ?stream=https://... → reenvía el stream (vídeo)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url") || url.searchParams.get("stream");
    if (!targetUrl) {
      return new Response("Uso: ?url=... o ?stream=...", { status: 400 });
    }
    let target;
    try {
      target = new URL(targetUrl);
    } catch {
      return new Response("URL inválida", { status: 400 });
    }
    // Solo permitir HTTP (Xtream)
    if (target.protocol !== "http:") {
      return new Response("Solo se permite redirigir a http://", { status: 400 });
    }
    try {
      const res = await fetch(target.toString(), {
        headers: request.headers.get("Accept") ? { Accept: request.headers.get("Accept") } : {},
      });
      const isStream = url.searchParams.has("stream");
      const headers = new Headers();
      if (res.headers.get("content-type")) headers.set("Content-Type", res.headers.get("Content-Type"));
      if (isStream && res.headers.get("content-length")) headers.set("Content-Length", res.headers.get("Content-Length"));
      return new Response(res.body, { status: res.status, headers });
    } catch (e) {
      return new Response("Proxy error: " + (e.message || String(e)), { status: 502 });
    }
  },
};
