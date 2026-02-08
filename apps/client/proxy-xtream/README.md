# Proxy Xtream para Expo Go

En **Expo Go** el dispositivo solo permite peticiones HTTPS. Los servidores Xtream usan `http://`, por eso falla con "Network request failed".

Este proxy recibe peticiones **HTTPS** y las reenvía al servidor Xtream por HTTP. Así puedes probar en Expo Go sin hacer un build nativo.

## 1. Desplegar el proxy (gratis, Cloudflare)

1. Entra en [Cloudflare Workers](https://workers.cloudflare.com) y crea una cuenta si no tienes.
2. **Create Worker** → nombre ej. `nexo-xtream-proxy`.
3. Pega el contenido de `worker.js` en el editor y **Deploy**.
4. Copia la URL del worker, ej. `https://nexo-xtream-proxy.tu-usuario.workers.dev`.

## 2. Configurar la app

En la carpeta del cliente (`apps/client`) crea un archivo **`.env`** (no lo subas a git):

```
EXPO_PUBLIC_XTREAM_PROXY=https://nexo-xtream-proxy.tu-usuario.workers.dev
```

Sustituye por la URL real de tu Worker.

## 3. Reiniciar Expo

Cierra el bundler y vuelve a arrancar para que cargue el `.env`:

```bash
cd apps/client
npx expo start
```

Abre la app en **Expo Go** y añade de nuevo el servidor Xtream. Las peticiones irán por HTTPS al proxy y el proxy hablará con el servidor por HTTP.

## Seguridad

- El proxy ve la URL completa (incluye usuario y contraseña Xtream en la query). Úsalo solo en desarrollo y con **tu** Worker (no compartas la URL del proxy).
- Añade `.env` al `.gitignore` si no está ya.

## Sin proxy (build nativo)

Si generas un build de desarrollo (`npx expo run:android`), la app puede usar HTTP directamente y **no necesitas** este proxy.
