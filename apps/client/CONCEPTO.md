# Nexo — Concepto de la app

## Qué es

**Nexo** es una app móvil (React Native / Expo) para consultar precios y tipos de cambio con foco en **Venezuela**: ver cuánto vale 1 USD en bolívares (oficial y paralelo), seguir criptomonedas en tu moneda preferida, y convertir entre USD, EUR y BS. Todo se apoya en una API propia que agrega fuentes (BCV, paralelo, Binance/CoinGecko, Frankfurter).

---

## Para quién

Personas que necesitan:
- Ver el **dólar paralelo** y el oficial (BCV) al instante.
- Consultar **criptos** (BTC, ETH, etc.) en USD/EUR/GBP.
- **Convertir** montos entre USD, EUR y bolívares (oficial/paralelo).
- Revisar **historial** de tasas (VES, EUR en BS, USD→EUR, y precios de crypto) para ver tendencias.

---

## Cómo está hecha (estructura)

- **Dos tabs**: **Precios** (inicio) y **Ajustes**.
- **Precios**: bloque de crypto con sparklines y variación 24h; bloque “BOLÍVARES · 1 USD” (oficial, paralelo, diferencia); “BOLÍVARES · 1 EUR”; “TIPO DE CAMBIO” (USD→EUR). Cada fila puede llevar a una pantalla de historial.
- **Convertidor**: pantalla aparte (no tab), entrada desde el icono de calculadora en el header de Precios. Convierte entre USD, EUR, BS oficial y BS paralelo.
- **Historial**: pantallas dedicadas para VES (oficial/paralelo/EUR), forex (USD/EUR) y crypto (por símbolo), con gráfica y lista por día.
- **Ajustes**: tema (oscuro/claro), URL de la API, divisa por defecto, cryptos favoritas.

---

## Cómo se ve (look & feel)

- **Estilo tipo Apple**: fondos sólidos (negro en oscuro, gris claro en claro), grupos con bordes suaves y esquinas redondeadas (~12px), etiquetas de sección en mayúsculas y gris.
- **Acento verde** `#0FA226` en precios, botones e iconos activos; rojo para errores y variaciones negativas.
- **Tipografía**: títulos grandes y en negrita, valores destacados, texto secundario más pequeño y gris.
- **Barra inferior**: barra de tabs flotante, redondeada, con margen a los lados; en oscuro usa blur; en claro, fondo blanco semitransparente. Solo dos ítems: Precios (icono de tendencia) y Ajustes (engranaje).
- **Sparklines**: minigráficos junto a cada fila (crypto, oficial/paralelo, USD→EUR) para ver la tendencia sin abrir historial.
- **Variación 24h** en crypto: pequeño texto verde/rojo a la derecha del nombre (“+2,30%” / “−1,10%”).
- **Comparador**: dentro del bloque “1 USD”, una fila “Diferencia paralelo − oficial” con +X BS y (Y%).

En conjunto: **limpio, legible y centrado en números**, sin decoración extra, pensado para uso rápido en el día a día.
