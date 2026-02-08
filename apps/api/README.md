# Nexo API

Backend con Bun. Incluye **aggregator de precios**: una capa unificada sobre varias APIs externas con cache y rate limit.

## Precios

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/prices/crypto/:symbol` | Precio de una crypto (ej. BTC, ETH). Query: `?currency=USD` |
| `GET /api/prices/crypto?symbols=BTC,ETH` | Varios símbolos. Query: `?symbols=BTC,ETH&currency=USD` |
| `GET /api/prices/forex?from=USD&to=EUR` | Tipo de cambio entre divisas |

**Contrato unificado:**
- Crypto: `{ symbol, price, currency, source, timestamp }`
- Forex: `{ from, to, rate, date, source, timestamp }`

**Resiliencia:**
- **Crypto:** Binance → CoinGecko (fallback)
- **Forex:** Frankfurter (sin API key)
- **Cache:** 1 minuto en memoria
- **Rate limit:** 60 req/min por IP (headers `X-RateLimit-*`)

Headers útiles en respuesta: `X-Cache: HIT|MISS`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

## Scripts

- `bun run dev` — servidor con hot reload
- `bun run start` — producción
