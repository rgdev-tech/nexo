# Generar capturas para App Store

## Tamaños requeridos (iPhone)

| Dispositivo | Resolución (px) |
|-------------|-----------------|
| 6.7" (iPhone 15 Pro Max) | 1290 x 2796 |
| 6.5" (iPhone 11 Pro Max) | 1284 x 2778 |
| 5.5" (iPhone 8 Plus) | 1242 x 2208 |

## Pasos

1. Iniciar simulador:
   ```bash
   cd apps/client
   npx expo run:ios
   ```

2. En el simulador, seleccionar dispositivo:
   - Xcode → Window → Devices and Simulators
   - O en el menú del simulador: File → Open Simulator → iOS 17+ → iPhone 15 Pro Max (para 6.7")

3. Navegar a las pantallas clave:
   - Home (precios)
   - Conversor
   - Perfil / Ajustes

4. Capturar: Cmd+S (guardar en escritorio) o File → Save Screen

5. Opcional: recortar o añadir marco con herramientas como [AppMockUp](https://app-mockup.com) o Figma.

## Mínimo

Apple requiere al menos un set de capturas por tamaño. Puedes usar las mismas imágenes si se ven bien escaladas, aunque es mejor tener capturas nativas de cada resolución.
