# Nexo – Roadmap de funcionalidades

## Precios y mercado

- [ ] **Alertas de precio** – Notificaciones push cuando el dólar paralelo, una crypto o el forex cruce un umbral definido por el usuario. Endpoints: `POST /api/alerts`, `GET /api/alerts`, `DELETE /api/alerts/:id`.
- [ ] **Precio promedio ponderado** – Agregar fuentes adicionales (Binance P2P VES, EnParaleloVzla, Monitor Dolar) y devolver un promedio junto con el desglose por fuente.
- [ ] **Más pares forex** – Soportar COP, BRL, ARS, MXN (monedas latam relevantes para remesas).
- [ ] **Tasa de cambio Euro paralelo** – Calcular EUR→VES directo (no solo USD→VES y USD→EUR por separado).

## Balance y finanzas personales

- [ ] **Presupuestos mensuales** – Definir límites por categoría y trackear el porcentaje consumido. Endpoints: `POST /api/budgets`, `GET /api/budgets`.
- [ ] **Exportar transacciones** – `GET /api/balance/export?format=csv` para descargar el historial.
- [ ] **Recurrentes** – Registrar gastos/ingresos recurrentes (alquiler, sueldo) que se agreguen automáticamente cada mes.
- [ ] **Multi-moneda en balance** – Registrar transacciones en USD, EUR o BsF y que el balance calcule totales en la moneda preferida usando las tasas actuales.

## Usuarios y social

- [ ] **Preferencias en la nube completas** – Sincronizar alertas, favoritos crypto, transacciones del balance (ahora solo se sincronizan theme y currency).
- [ ] **Compartir snapshot** – `GET /api/share/snapshot` que genere una imagen o link con los precios del momento para compartir en redes/WhatsApp.

## Infraestructura y calidad

- [ ] **Webhooks / WebSockets** – Para precios en tiempo real sin polling desde el cliente.
- [ ] **Rate limiting por usuario** – Endpoints autenticados con límites distintos al throttling general.
- [ ] **Cache más granular** – TTL diferente para VES (cambia pocas veces al día) vs crypto (cambia cada minuto).
- [ ] **Logs y analytics** – Endpoint interno o integración con un servicio para saber qué consultan más los usuarios.

## Valor agregado

- [ ] **Calculadora de remesas** – Simular cuánto llega en BsF al enviar X USD/EUR por distintos canales (Zelle, Binance P2P, Western Union), considerando comisiones.
- [ ] **Noticias/feed económico** – Endpoint que consuma un RSS de noticias económicas de Venezuela (BCV, inflación, etc.).
- [ ] **Widget de resumen diario** – `GET /api/daily-summary` que devuelva un JSON con las variaciones del día (dólar, euro, BTC) listo para un widget en iOS/Android.
