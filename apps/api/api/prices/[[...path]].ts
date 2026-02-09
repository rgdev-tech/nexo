/**
 * Vercel serverless: todas las rutas /api/prices/*.
 * getVesHistory se sustituye por [] (sin SQLite en serverless).
 */
import { createHandlePrices } from "../../src/prices.js";

const handlePrices = createHandlePrices(() => []);

export default async function handler(request: Request): Promise<Response> {
  const res = await handlePrices(request, request.url);
  if (res) return res;
  return new Response(JSON.stringify({ error: "not_found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
