# Build iOS standalone con Xcode (sin EAS)

**Standalone** = la app lleva el JavaScript dentro. Funciona en el iPhone **sin computadora, sin Metro, sin cable**. Una vez instalada, es una app normal.

---

## Build standalone e instalar en tu iPhone (rápido)

Desde la raíz del monorepo o desde `apps/client`:

```bash
cd apps/client
npx expo run:ios --configuration Release --device
```

- Conecta el iPhone por cable (solo para instalar).
- El comando compila en **Release**, empaqueta el JS dentro de la app e instala en el dispositivo.
- Cuando termine, **desconecta el iPhone**: la app funciona sola, sin PC ni Metro.

Si es la primera vez, antes puede hacer falta:

```bash
cd apps/client
npx expo prebuild --platform ios
cd ios && pod install && cd ..
```

Y en Xcode (abre `ios/nexo.xcworkspace`) configurar **Signing & Capabilities** con tu Apple ID en **Team**.

---

## Build standalone desde Xcode (Archive / IPA)

Para generar un .ipa que puedas instalar en otros dispositivos o subir a TestFlight:

1. **Preparar proyecto** (si hace falta):
   ```bash
   cd apps/client
   npx expo prebuild --platform ios
   cd ios && pod install
   ```

2. **Abrir Xcode** (siempre el **workspace**):
   ```bash
   open apps/client/ios/nexo.xcworkspace
   ```

3. **Signing:** proyecto **nexo** → target **nexo** → **Signing & Capabilities** → "Automatically manage signing" + tu **Team**.

4. **Build standalone (Release):**
   - Destino: **Any iOS Device (arm64)**.
   - Menú **Product** → **Archive**.
   - El Archive usa configuración **Release**: el JS va embebido, la app es standalone.

5. En el **Organizer**: **Distribute App** → elige Ad Hoc (para instalar en dispositivos concretos) o App Store Connect (TestFlight/App Store). O **Export** para obtener el .ipa.

Ese .ipa instalado en cualquier iPhone funciona **solo**, sin computadora.

---

## Resumen

| Objetivo | Comando / Acción |
|---------|-------------------|
| Instalar en mi iPhone y que funcione solo | `npx expo run:ios --configuration Release --device` |
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
