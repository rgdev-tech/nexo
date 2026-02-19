export type AlertType = 'ves' | 'crypto' | 'forex';
export type AlertDirection = 'above' | 'below';

export type Alert = {
  id: string;
  user_id: string;
  type: AlertType;
  symbol: string;
  threshold: number;
  direction: AlertDirection;
  enabled: boolean;
  triggered_at: string | null;
  created_at: string;
  updated_at: string;
};
