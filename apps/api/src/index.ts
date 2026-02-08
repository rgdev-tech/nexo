import { handlePrices } from "./prices";
import { backfillUsdEurFromFrankfurter, fetchAndSaveVes } from "./ves-history";

const port = Number(process.env.PORT) || 3000;
const VES_HOUR_MS = 60 * 60 * 1000;
const hostname = process.env.HOST ?? "0.0.0.0";

Bun.serve({
  port,
  hostname,
  async fetch(req: Request) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "nexo-api" });
    }

    if (url.pathname.startsWith("/api/prices")) {
      const res = await handlePrices(req, req.url);
      if (res) return res;
    }

    if (url.pathname === "/" || url.pathname === "/api") {
      return Response.json({
        name: "nexo-api",
        endpoints: {
          health: "GET /health",
          prices: {
            crypto: "GET /api/prices/crypto/:symbol?currency=USD",
            cryptoBatch: "GET /api/prices/crypto?symbols=BTC,ETH&currency=USD",
            forex: "GET /api/prices/forex?from=USD&to=EUR",
            ves: "GET /api/prices/ves (1 USD = X BS oficial/paralelo)",
          },
        },
      }, {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

fetchAndSaveVes().catch(() => {});
// Rellena usd_eur en historial existente con datos de Frankfurter (USD/EUR) para que el gráfico EUR funcione
backfillUsdEurFromFrankfurter().catch(() => {});
setInterval(() => fetchAndSaveVes().catch(() => {}), VES_HOUR_MS);

console.log(`Nexo API → http://localhost:${port}`);
console.log(`Precios  → http://localhost:${port}/api/prices/crypto/BTC`);
if (hostname === "0.0.0.0") {
  console.log(`         (En emulador/dispositivo usa la IP de esta máquina, ej. http://192.168.x.x:${port})`);
}
