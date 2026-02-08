# Nexo

App de streaming IPTV (listas M3U) — monorepo con **Bun**, **Turbo** y **Expo**.

## Arquitectura

- **client** — Frontend Expo (React Native) con Expo Router.
- **api** — Backend con Bun (`Bun.serve`).

## Stack

| Capa           | Tecnología        |
|----------------|-------------------|
| Monorepo       | Bun workspaces    |
| Orquestación   | Turborepo (TUI en terminal) |
| Frontend       | Expo, Expo Router |
| Backend        | Bun               |
| Variables de entorno | Doppler   |
| Queries (futuro) | TanStack Query  |
| Terminal UI      | Turbo TUI (`turbo.json` → `"ui": "tui"`) |

## Requisitos

- [Bun](https://bun.sh) (runtime y package manager)
- [Doppler](https://doppler.com) (opcional; para envs)

## Setup

```bash
# Instalar dependencias (desde la raíz)
bun install

# Con Doppler (recomendado): inyectar envs al correr comandos
doppler run -- bun install
```

## Levantar el proyecto

**Un solo comando** desde la raíz levanta client (Expo) y API (Bun) a la vez:

```bash
bun dev
```

(o `bun run dev`). Turbo orquesta ambos: Expo en el client, servidor en `apps/api`. API en `http://localhost:3000`, Metro/Expo en `http://localhost:8081`.

## Scripts (raíz)

| Comando   | Descripción                    |
|-----------|--------------------------------|
| `bun dev` | **Todo:** client + API (recomendado) |
| `bun run client`| Solo frontend (Expo)           |
| `bun run api`   | Solo backend (Bun)             |
| `bun run build` | Build de todas las apps        |
| `bun run lint`  | Lint en todo el monorepo       |

## Desarrollo con Doppler

Configura el proyecto en Doppler y luego:

```bash
# API con variables de Doppler
doppler run -- bun run api

# Client (si necesitas envs)
doppler run -- bun run client

# Todo el monorepo
doppler run -- bun run dev
```

Crea un `doppler.yaml` en la raíz o en cada app si quieres config por carpeta.

## Estructura

```
nexo/
├── package.json       # workspaces: client, api
├── turbo.json         # Turbo + TUI
├── tsconfig.json      # Base TS
├── apps/
│   ├── client/        # Expo (Expo Router)
│   │   ├── app/       # File-based routes
│   │   └── assets/
│   └── api/           # Bun server
│       └── src/
└── README.md
```

## Licencia

MIT — rgdev-tech
