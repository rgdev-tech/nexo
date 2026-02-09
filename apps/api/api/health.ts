export default function handler(): Response {
  return new Response(JSON.stringify({ ok: true, service: "nexo-api" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
