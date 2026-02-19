# Build iOS standalone con Xcode (sin EAS)

**Standalone** = la app lleva el JavaScript dentro. Funciona en el iPhone **sin computadora, sin Metro, sin cable**. Una vez instalada, es una app normal.

---

## Build standalone para Vercel (recomendado)

Si tu API está en Vercel (`https://nexo-api.vercel.app`), usa este comando para que la app apunte a producción:

```bash
cd apps/client
bun run build:standalone
```

(o `npm run build:standalone` / `pnpm build:standalone`)

O manualmente:

```bash
EXPO_PUBLIC_API_URL=https://nexo-api.vercel.app npx expo run:ios --configuration Release --device
```

- Conecta el iPhone por cable.
- La app se compila e instala con la API de Vercel embebida. No necesita WiFi local ni tu computadora.

Si tu API de Vercel usa otra URL, cámbiala en el comando o en `apps/client/.env.production`.

---

## Build standalone e instalar en tu iPhone (genérico)

```bash
cd apps/client
npx expo run:ios --configuration Release --device
```

⚠️ **Cuidado**: Si tu `.env` tiene una IP local (ej. `192.168.x.x`), la app usará esa URL y **no funcionará** fuera de tu WiFi. Para standalone que funcione en cualquier sitio, usa `build:standalone` o asegúrate de que `EXPO_PUBLIC_API_URL` apunte a Vercel.

Si es la primera vez, antes puede hacer falta:

```bash
cd apps/client
npx expo prebuild --platform ios
cd ios && pod install && cd ..
```

Y en Xcode (abre `ios/nexo.xcworkspace`) configurar **Signing & Capabilities** con tu Apple ID en **Team**.

---

## Build para App Store (Xcode Archive)

Para generar un **.ipa** listo para TestFlight o App Store:

### 1. Configurar API de Vercel

El archivo `ios/.xcode.env.local` ya está creado con la URL de producción (`https://nexo-api.vercel.app`). Si tu API usa otra URL, edítalo:

```bash
# apps/client/ios/.xcode.env.local
export EXPO_PUBLIC_API_URL=https://nexo-api.vercel.app
export EXPO_PUBLIC_SUPABASE_URL=https://...
export EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Este archivo es **gitignored**; Xcode lo usa al hacer Archive para embeber la URL en el bundle.

### 2. Preparar proyecto (si hace falta)

```bash
cd apps/client
npx expo prebuild --platform ios
cd ios && pod install && cd ..
```

### 3. Abrir Xcode (siempre el workspace)

```bash
open apps/client/ios/nexo.xcworkspace
```

### 4. Signing

Proyecto **nexo** → target **nexo** → **Signing & Capabilities** → "Automatically manage signing" + tu **Team** (Apple Developer).

### 5. Archive (build tipo App Store)

1. Destino: **Any iOS Device (arm64)** (no Simulator).
2. Menú **Product** → **Archive**.
3. Espera a que termine el build (incluye el bundle de JS).

### 6. Distribuir

En el **Organizer** (ventana que se abre al terminar):

- **Distribute App** → **App Store Connect** (para TestFlight / App Store).
- O **Ad Hoc** para instalar en dispositivos registrados.
- O **Export** para obtener el .ipa.

El .ipa resultante es un build **production**: JS embebido, sin Metro, apuntando a Vercel.

---

## Resumen

| Objetivo | Comando / Acción |
|---------|-------------------|
| Instalar en mi iPhone (Vercel) | `bun run build:standalone` desde `apps/client` |
| **Build App Store (IPA)** | Xcode → Product → Archive → Distribute App |
| Generar .ipa para instalar en otros iPhones | Xcode → Product → Archive → Distribute / Export |

**Importante:** usa siempre **Release**, no Debug. En Release el bundle va dentro de la app; en Debug la app intentaría conectar con Metro en la PC.

---

## Cómo hacer que la API funcione en standalone

En el dispositivo, **127.0.0.1** es el propio iPhone, no tu computadora. Para que Precios cargue datos tienes que usar una URL a la que el iPhone pueda conectarse:

### Opción A: API en tu red (misma WiFi)

1. En tu Mac/PC, arranca la API (`apps/api`).
2. Averigua la IP local de esa máquina (ej. `192.168.4.163`).
3. **Antes del build:** en `apps/client` crea o edita `.env` con:
   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.4.163:3000
   ```
   Vuelve a hacer el build. La app usará esa URL por defecto.
4. O **después de instalar:** abre la app → **Ajustes** → cambia la URL de la API a `http://TU_IP:3000` (misma WiFi).
5. El iPhone y la computadora tienen que estar en la **misma red WiFi**.

### Opción B: API en internet (standalone total)

**Desplegar la API en Vercel (recomendado):**

1. En el repo, la API está preparada para Vercel en `apps/api` (rutas en `api/`, `vercel.json`).
2. En [vercel.com](https://vercel.com) → Add New Project → Import repo → **Root Directory:** `apps/api`.
3. Deploy. Obtendrás una URL como `https://nexo-api-xxx.vercel.app`.
4. En `apps/client` crea o edita `.env`:
   ```bash
   EXPO_PUBLIC_API_URL=https://nexo-api-xxx.vercel.app
   ```
5. Vuelve a hacer el build de la app. La app funcionará en cualquier sitio con internet.

Más detalle en `apps/api/DEPLOY-VERCEL.md`.
