const port = Number(process.env.PORT) || 3000;

Bun.serve({
  port,
  fetch(req: Request) {
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "nexo-api" });
    }
    return new Response("Nexo API", {
      headers: { "Content-Type": "text/plain" },
    });
  },
});

console.log(`Nexo API → http://localhost:${port}`);
