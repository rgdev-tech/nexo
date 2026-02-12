export type CryptoHistoryDay = { date: string; price: number };

export type ForexHistoryDay = { date: string; rate: number };

export type VesHistoryDay = {
  date: string;
  oficial: number;
  paralelo: number;
  oficial_eur?: number;
  paralelo_eur?: number;
};

/** Union type para uso genérico (e.g. sparklines en la pantalla principal) */
export type HistoryDay = CryptoHistoryDay | ForexHistoryDay | VesHistoryDay;
