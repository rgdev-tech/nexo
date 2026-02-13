-- =============================================================
-- Migración base: esquema actual de Supabase (profiles + ves_history)
-- Generada manualmente para versionar el esquema existente.
-- =============================================================

-- Tabla de perfiles de usuario (vinculada a auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  first_name  text,
  last_name   text,
  avatar_url  text,
  preferences jsonb,
  created_at  timestamptz,
  updated_at  timestamptz
);

-- Tabla de historial de tasas VES
-- NOTA: El esquema original usa text para datetime y float8 para tasas.
-- Estos tipos se corregirán en la siguiente migración.
CREATE TABLE IF NOT EXISTS ves_history (
  datetime  text PRIMARY KEY,
  oficial   float8,
  paralelo  float8,
  usd_eur   float8
);
