export type ThemeMode = 'light' | 'dark';

export interface UserPreferences {
  defaultCurrency?: string;
  favoriteCryptos?: string[];
  theme?: ThemeMode;
  balanceFaceIdEnabled?: boolean;
}
