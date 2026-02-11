export const LEGAL_URLS = {
  terms: 'https://zonark-portfolio.vercel.app/legal/terminos',
  privacy:
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || 'https://zonark-portfolio.vercel.app/legal/privacidad',
} as const;
