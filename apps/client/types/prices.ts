export type CryptoPrice = {
  symbol: string;
  price: number;
  currency: string;
  source: string;
  timestamp: number;
  change24h?: number;
};

export type ForexRate = {
  from: string;
  to: string;
  rate: number;
  date: string;
  source: string;
  timestamp: number;
};

export type VesSource = {
  nombre: string;
  valor: number;
  timestamp: number;
};

export type UsdToVes = {
  from: string;
  to: string;
  oficial: number;
  paralelo: number;
  oficial_eur?: number;
  paralelo_eur?: number;
  date: string;
  source: string;
  timestamp: number;
  fuentes?: VesSource[];
};
