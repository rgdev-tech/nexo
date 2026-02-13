-- =============================================================
-- Migración: Corregir tipos de dato en ves_history y agregar
-- trigger updated_at en profiles.
-- =============================================================

-- 1. Corregir datetime de text a timestamptz
ALTER TABLE ves_history
  ALTER COLUMN datetime TYPE timestamptz USING datetime::timestamptz;

-- 2. Corregir float8 a numeric para precisión financiera
ALTER TABLE ves_history
  ALTER COLUMN oficial TYPE numeric(12,4) USING oficial::numeric,
  ALTER COLUMN paralelo TYPE numeric(12,4) USING paralelo::numeric,
  ALTER COLUMN usd_eur TYPE numeric(12,6) USING usd_eur::numeric;

-- 3. Constraints de integridad
ALTER TABLE ves_history
  ADD CONSTRAINT ves_history_oficial_positive CHECK (oficial >= 0),
  ADD CONSTRAINT ves_history_paralelo_positive CHECK (paralelo >= 0);

-- 4. Índice para queries temporales
CREATE INDEX IF NOT EXISTS idx_ves_history_datetime_desc
  ON ves_history (datetime DESC);

-- 5. Defaults y trigger en profiles
ALTER TABLE profiles
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
