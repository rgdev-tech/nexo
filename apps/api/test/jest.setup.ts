/**
 * Setup global para los tests E2E.
 * Evita que VesService lance background jobs (fetchAndSaveVes, intervalos).
 */
process.env.VERCEL = '1';
