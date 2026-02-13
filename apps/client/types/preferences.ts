/**
 * Espejo de apps/api/src/shared/types/user-preferences.ts.
 * IMPORTANTE: Mantener sincronizado con la definición canónica en la API.
 * TODO: Mover a un paquete compartido (packages/shared-types).
 *
 * Se usa `type` (no `interface`) para ser compatible con el tipo `Json` de Supabase.
 */

export type ThemeMode = 'light' | 'dark';

export type UserPreferences = {
  defaultCurrency?: string;
  favoriteCryptos?: string[];
  theme?: ThemeMode;
  balanceFaceIdEnabled?: boolean;
};
