# Desplegar la API Nexo en Vercel

La API se puede desplegar en Vercel para tener una URL pública HTTPS (útil para el build standalone de la app).

## Pasos

1. **Sube el repo a GitHub** (si aún no está).

2. **En [vercel.com](https://vercel.com)** → Add New Project → Import your repo.

3. **Configura el proyecto:**
   - **Root Directory:** `apps/api` (importante: así Vercel usa solo la carpeta de la API).
   - **Framework Preset:** Other.
   - **Build Command:** puedes dejar vacío o `echo 'OK'`.
   - **Output Directory:** vacío.
   - No hace falta **Install Command** si el root del monorepo tiene las dependencias; si falla, pon `bun install` o `npm install` con el root en `apps/api`.

4. **Deploy.** Vercel compilará las funciones en `api/` y las rutas quedarán así:
   - `https://tu-proyecto.vercel.app/api/prices/ves`
   - `https://tu-proyecto.vercel.app/api/prices/crypto?symbols=BTC,ETH`
   - `https://tu-proyecto.vercel.app/health`

5. **En la app (build standalone):**  
   En `apps/client` crea o edita `.env`:
   ```bash
   EXPO_PUBLIC_API_URL=https://tu-proyecto.vercel.app
   ```
   Vuelve a hacer el build de la app. La app usará esa URL por defecto.

## Notas

- **Historial VES:** En Vercel (serverless) no hay SQLite persistente, así que `/api/prices/ves/history` devuelve `{ history: [] }`. Los precios actuales (VES, crypto, forex) sí funcionan.
- Si el deploy falla por “cannot find module” al importar desde `src/`, en **Project Settings → Functions** revisa que el **Node.js Version** sea 18.x o 20.x y que el Root Directory sea `apps/api`.
- **Variables de entorno:** Si en el futuro la API usa claves (por ejemplo para alguna API externa), añádelas en Vercel: Project → Settings → Environment Variables.
