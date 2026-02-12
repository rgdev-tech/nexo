# Ticket #21 – Mover colores hardcodeados al tema

## Criterios de aceptación

1. **Tema como única fuente de color**
   - Todos los colores usados en la UI del cliente provienen de `theme.ts` (getColors, getGlass, getGlassCard).
   - No quedan literales de color (hex, rgb/rgba) en componentes ni pantallas, salvo en la definición de `darkColors` y `lightColors` en `theme.ts`.

2. **Tokenización completa**
   - ColorScheme incluye los tokens necesarios: background, text, textSecondary, textMuted, accent, error, groupBg, groupBorder, rowBorder, inputMuted, accentOnAccent, surface, surfaceSecondary, modalOverlay, ripple, tabBarBg, tabBarBorder, tabBarInactive, tabBarOverlay, shadow, accentMuted.
   - Glass y glassCard dependen del tema vía getGlass(theme) y getGlassCard(theme).

3. **Componentes consumen tema**
   - SummaryCard, HistoryList, HistoryChart, DaysSelector, Sparkline, StoryCard y ContentSection usan useSettings() + getColors(theme) (o reciben theme) y aplican colores del tema por defecto.
   - Las pantallas pueden seguir pasando colores como override cuando sea necesario.

4. **Pantallas consumen tema**
   - Todas las pantallas (tabs, history, auth, convertidor, etc.) obtienen colores con getColors(settings.theme) y usan solo tokens del tema en estilos.

5. **Modo claro y oscuro**
   - Al cambiar el tema en Ajustes (Oscuro / Claro), toda la app refleja el cambio: fondos, textos, bordes, botones, tab bar, modales y gráficos se ven correctos en ambos modos.

6. **Sin regresiones visuales**
   - La apariencia en modo oscuro se mantiene equivalente a la anterior.
   - La apariencia en modo claro es consistente y con buen contraste.

---

## Cómo testearlo

### 1. Pruebas manuales (smoke)

- **Cambio de tema**
  1. Abrir la app y ir a Ajustes.
  2. Cambiar entre "Oscuro" y "Claro".
  3. Verificar que en cada pantalla los fondos, textos, botones y bordes cambian según el tema (sin parpadeos ni colores rotos).

- **Pantallas a revisar con ambos temas**
  - **Precios (Home):** fondo, títulos, grupos, filas, acentos, modal de compartir.
  - **Balance:** lista, botones Ingreso/Gasto, modales de agregar y saldo inicial, overlay de modales.
  - **Ajustes:** secciones, switches, botones de tema y de divisa, chips de cryptos, enlaces legales.
  - **Perfil:** card vacía, botón "Iniciar sesión", avatar y menú cuando hay sesión.
  - **Historial VES / Forex / Crypto:** cabecera, selector de días, SummaryCard, gráfico, lista; mensajes de error y vacío.
  - **Login / Registro:** inputs, botón primario, enlaces.
  - **Convertidor:** input, píldora de moneda, fichas de resultados.
  - **Tab bar:** fondo, borde, iconos y etiquetas activos/inactivos en ambos temas.

- **Comprobaciones rápidas**
  - Botones primarios (verde) tienen texto/icono blanco legible.
  - Texto secundario y muted siguen siendo legibles sobre el fondo.
  - Modales tienen overlay oscuro y contenido con fondo del tema.
  - Gráficos e historiales usan colores del tema (accent, grid, ejes).

### 2. Búsqueda de literales (regresión)

Ejecutar en la raíz del cliente:

```bash
cd apps/client
rg -n "#[0-9a-fA-F]{3,8}|rgb\(|rgba\(" --glob "!theme.ts" --glob "*.tsx" --glob "*.ts" .
```

- **Aceptable:** coincidencias solo en `theme.ts` (definición de darkColors/lightColors y helpers).
- **Inaceptable:** literales en componentes o pantallas (ej. SummaryCard, index, login, etc.).

### 3. Lint y tipos

```bash
cd apps/client
npm run lint
```

- Debe terminar sin errores.
- El IDE no debe marcar errores de tipos en archivos que usan getColors, getGlass o getGlassCard.

### 4. Pruebas automatizadas (opcional)

- **Unit:** tests para getColors("light") y getColors("dark") que comprueben que devuelven objetos con las claves de ColorScheme y que valores de light y dark difieren donde debe (p. ej. background, text).
- **Unit:** getGlass("light") y getGlass("dark") devuelven objetos con backgroundColor, borderColor, etc., y los valores cambian según el tema.
- No es obligatorio tener E2E de tema; el smoke manual suele ser suficiente para este ticket.

---

## Resumen de checklist para cerrar el ticket

- [ ] Cambio Oscuro/Claro en Ajustes actualiza toda la app.
- [ ] Revisión visual de todas las pantallas en ambos temas sin colores rotos.
- [ ] Grep de literales sin resultados fuera de `theme.ts`.
- [ ] `npm run lint` en cliente sin errores.
- [ ] (Opcional) Tests unitarios de getColors y getGlass pasando.
