# Pasos para publicar en App Store

## Pre-requisitos

- Cuenta Apple Developer activa
- EAS CLI: `npm install -g eas-cli`
- Login en EAS: `eas login`

## 1. Inicializar EAS (solo la primera vez)

```bash
cd apps/client
eas init
```

Vincula el proyecto a tu cuenta de Expo. Si no tienes proyecto, EAS crea uno.

## 2. Configurar eas.json

Edita `apps/client/eas.json` y reemplaza en `submit.production.ios`:

- `TU_EMAIL` → tu Apple ID
- `TU_APP_ID` → App Store Connect App ID (después de crear la app en App Store Connect)

## 3. Build de producción

```bash
cd apps/client
eas build --platform ios --profile production
```

**Nota:** La primera vez, ejecuta el comando **en modo interactivo** (sin `--non-interactive`) para configurar las credenciales de iOS (Distribution Certificate, Provisioning Profile). EAS te guiará.

Tiempo estimado: 15–45 min. EAS usará las variables de `apps/client/.env.production` o EAS Secrets.

## 4. Subir a App Store Connect

Cuando el build termine:

```bash
eas submit --platform ios --profile production --latest
```

O descarga el .ipa desde el dashboard de EAS y sube con Xcode Organizer.

## 5. Submit for Review

1. App Store Connect → My Apps → Nexo → versión 1.0.0
2. Build: selecciona el build subido
3. Responde las preguntas de exportación (normalmente "No" para encripción estándar)
4. Submit for Review

La revisión de Apple suele tardar 24–48 horas.
