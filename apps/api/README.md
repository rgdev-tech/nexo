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
- `bun run test` — ejecutar suite de tests E2E (Jest + Supertest)

## Tests

Suite E2E con **Jest** y **Supertest** sobre NestJS Testing. Cada archivo levanta la app completa y hace peticiones HTTP reales contra los endpoints.

```bash
# Ejecutar desde apps/api
bun run test

# Ejecutar desde la raíz del monorepo
bun run --filter=api test
```

**Archivos de test:**

| Archivo | Qué cubre |
|---------|-----------|
| `test/validation.e2e-spec.ts` | Validación de DTOs (400) y happy paths (200) para crypto, forex, ves y cron |
| `test/health.e2e-spec.ts` | `GET /` y `GET /api/health` — respuestas y estructura del body |
| `test/cron-auth.e2e-spec.ts` | Autenticación del cron: token incorrecto (401) y correcto (200) con VesService mockeado |
| `test/users-auth.e2e-spec.ts` | Endpoints protegidos `/api/users/profile`: rechazo sin token y con token inválido (401) |

**Variables de entorno necesarias:** `SUPABASE_URL`, `SUPABASE_KEY` (o `SUPABASE_SERVICE_ROLE_KEY`). Los tests de cron-auth mockean `ConfigService` y no necesitan `CRON_SECRET` real.
