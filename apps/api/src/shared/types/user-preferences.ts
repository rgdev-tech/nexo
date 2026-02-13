/**
 * Definición canónica de UserPreferences.
 * IMPORTANTE: Mantener sincronizado con apps/client/types/preferences.ts.
 * TODO: Mover a un paquete compartido (packages/shared-types).
 *
 * Se usa `type` (no `interface`) para ser compatible con el tipo `Json` de Supabase,
 * ya que los `interface` de TypeScript no tienen index signature implícita.
 */

export type ThemeMode = 'light' | 'dark';

export type UserPreferences = {
  defaultCurrency?: string;
  favoriteCryptos?: string[];
  theme?: ThemeMode;
  balanceFaceIdEnabled?: boolean;
};
