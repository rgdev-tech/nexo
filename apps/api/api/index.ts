export default function handler(): Response {
  return new Response(
    JSON.stringify({
      name: "nexo-api",
      endpoints: {
        health: "GET /health",
        prices: {
          crypto: "GET /api/prices/crypto/:symbol?currency=USD",
          cryptoBatch: "GET /api/prices/crypto?symbols=BTC,ETH&currency=USD",
          forex: "GET /api/prices/forex?from=USD&to=EUR",
          ves: "GET /api/prices/ves",
        },
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
