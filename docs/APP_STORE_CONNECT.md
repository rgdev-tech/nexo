# Guía: App Store Connect

Pasos para crear y configurar la app Nexo en App Store Connect.

## 1. Crear la app

1. Ir a [App Store Connect](https://appstoreconnect.apple.com) → My Apps → +
2. New App
3. Completar:
   - **Platform:** iOS
   - **Name:** Nexo
   - **Primary Language:** Spanish (o el que prefieras)
   - **Bundle ID:** `dev.rgtech.nexo` (debe coincidir con app.json)
   - **SKU:** `nexo-ios-1`
   - **User Access:** Full Access

## 2. Información requerida (versión 1.0.0)

| Campo | Valor |
|-------|-------|
| Privacy Policy URL | URL pública de [docs/privacy-policy.html](privacy-policy.html) |
| Category | Finance o Utilities |
| Description | Descripción corta y larga de la app |
| Keywords | precios, VES, crypto, forex, convertidor |
| Support URL | Tu email o web (ej. mailto:tu@email.com) |
| Marketing URL | Opcional |
| Promotional Text | Opcional (visible sin nueva versión) |
| What's New | "Primera versión de Nexo." |

## 3. Capturas de pantalla

Tamaños requeridos (px):

- **6.7"** (iPhone 15 Pro Max): 1290 x 2796
- **6.5"** (iPhone 11 Pro Max): 1284 x 2778
- **5.5"** (iPhone 8 Plus): 1242 x 2208

Usar simulador: `cd apps/client && npx expo run:ios` y capturar con Cmd+S.

## 4. Información de revisión

- **Contact Email:** Tu email para que Apple te contacte
- **Contact Phone:** Opcional
- **Demo Account:** Si la app requiere login, proporciona credenciales de prueba
- **Notes:** Opcional, para el equipo de revisión

## 5. Configuración de la app (general)

- **Price:** Free
- **Availability:** Todos los países o los que selecciones

## 6. Obtener ascAppId

Después de crear la app, el **App Store Connect App ID** (ascAppId) está en:
- App Store Connect → My Apps → Nexo → App Information → Apple ID (número)

Usa este valor en `eas.json` en `submit.production.ios.ascAppId`.
