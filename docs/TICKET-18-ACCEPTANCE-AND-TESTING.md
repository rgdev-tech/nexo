# Ticket #18 – Suite de testing E2E backend con Jest + Supertest

## Criterios de aceptación

1. **Jest como test runner**
   - El script `test` en `apps/api/package.json` ejecuta Jest (no Bun test).
   - Existe `apps/api/jest.config.ts` con transform ts-jest, moduleNameMapper para aliases y forceExit habilitado.
   - Los globals de Jest (`describe`, `it`, `expect`, `beforeAll`, `afterAll`) se usan sin importar desde `bun:test`.

2. **Suite de validación (migrada)**
   - `test/validation.e2e-spec.ts` ejecuta con Jest y pasa todos los tests existentes:
     - Crypto: rechazo de currency inválida, query param desconocido, aceptación de currency válida.
     - Crypto history: rechazo de days=0, days=9999, days=abc, currency inválida; aceptación de params válidos.
     - Forex: rechazo de from/to inválidos; aceptación de currencies válidas.
     - Forex history: rechazo de days=0, days=9999, from inválido.
     - VES history: rechazo de days=0, days=9999, days=abc.
     - Cron: rechazo de header faltante, formato sin Bearer, Bearer con token vacío.

3. **Tests de health (nuevos)**
   - `test/health.e2e-spec.ts` verifica:
     - `GET /` → 200 con `name`, `status: "ok"`, `docs`, `endpoints`.
     - `GET /api/health` → 200 con `status: "ok"` y `timestamp` ISO válido.

4. **Tests de autenticación cron (nuevos)**
   - `test/cron-auth.e2e-spec.ts` verifica con VesService mockeado y CRON_SECRET inyectado:
     - `Bearer wrong-secret` → 401.
     - `Bearer <CRON_SECRET>` → 200 con `{ ok: true, message: "VES snapshot saved" }`.

5. **Tests de autenticación usuarios (nuevos)**
   - `test/users-auth.e2e-spec.ts` verifica:
     - `GET /api/users/profile` sin token → 401.
     - `GET /api/users/profile` con Bearer inválido → 401.
     - `PATCH /api/users/profile` sin token → 401.
     - `PATCH /api/users/profile` con Bearer inválido → 401.

6. **CI ejecuta tests**
   - `.github/workflows/ci.yml` tiene un paso "Test" que ejecuta `bun run --filter=api test`.
   - Las variables de entorno necesarias (SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET) están configuradas en el workflow.

7. **Turbo reconoce tarea test**
   - `turbo.json` incluye la tarea `test` sin cache y sin dependencias.

---

## Cómo testearlo

### 1. Ejecutar la suite localmente

```bash
cd apps/api
bun run test
```

Resultado esperado: 4 suites, 29 tests, todos pasan.

### 2. Ejecutar desde la raíz del monorepo

```bash
bun run --filter=api test
```

Mismo resultado que el anterior.

### 3. Verificar migración de bun:test

```bash
cd apps/api
grep -r "bun:test" test/
```

No debe haber coincidencias.

### 4. Verificar estructura de archivos

```
apps/api/
├── jest.config.ts
├── test/
│   ├── validation.e2e-spec.ts    (migrado de bun:test a Jest)
│   ├── health.e2e-spec.ts        (nuevo)
│   ├── cron-auth.e2e-spec.ts     (nuevo)
│   └── users-auth.e2e-spec.ts    (nuevo)
```

### 5. Lint y tipos

```bash
cd apps/api
bun run lint
```

Debe terminar sin errores.

### 6. CI

- Hacer push a un PR y verificar que el paso "Test" se ejecuta y pasa en GitHub Actions.

---

## Resumen de checklist para cerrar el ticket

- [ ] `bun run test` en `apps/api` ejecuta Jest y pasa 29 tests (4 suites).
- [ ] No hay imports de `bun:test` en los archivos de test.
- [ ] `jest.config.ts` existe con configuración correcta (ts-jest, moduleNameMapper, forceExit).
- [ ] `turbo.json` incluye tarea `test`.
- [ ] CI ejecuta paso "Test" con variables de entorno configuradas.
- [ ] `bun run lint` sin errores en `apps/api`.
