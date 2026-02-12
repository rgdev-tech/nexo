/** Formato USD/EUR: 2 decimales, separador inglés */
export function formatMoney(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Alias semántico para USD */
export const formatUsd = formatMoney;

/** Alias semántico para EUR */
export const formatEur = formatMoney;

/** Formato Bs: hasta 2 decimales, separador venezolano */
export function formatBs(n: number): string {
  return n.toLocaleString("es-VE", { maximumFractionDigits: 2 });
}

/** Fecha relativa: "Hoy", "Ayer" o "12 ene" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Hoy";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-VE", { day: "numeric", month: "short" });
}

/** Símbolo de moneda: USD→$, EUR→€, GBP→£ */
export function currencySymbol(currency: string): string {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  if (currency === "GBP") return "£";
  return currency + " ";
}
