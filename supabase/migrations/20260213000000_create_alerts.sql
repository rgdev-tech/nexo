-- =============================================================
-- Migración: Crear tablas alerts y push_tokens
-- para el sistema de alertas de precio con notificaciones push.
-- =============================================================

-- Tabla de alertas de precio
CREATE TABLE alerts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN ('ves', 'crypto', 'forex')),
  symbol        text NOT NULL,
  threshold     numeric(18,6) NOT NULL CHECK (threshold > 0),
  direction     text NOT NULL CHECK (direction IN ('above', 'below')),
  enabled       boolean NOT NULL DEFAULT true,
  triggered_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_alerts_user_id ON alerts (user_id);
CREATE INDEX idx_alerts_enabled_type ON alerts (enabled, type) WHERE enabled = true;

-- Trigger updated_at (usa la función creada en migración anterior)
CREATE TRIGGER alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security)
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON alerts FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================
-- Tabla de push tokens para notificaciones
-- =============================================================

CREATE TABLE push_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       text NOT NULL,
  platform    text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Índices
CREATE INDEX idx_push_tokens_user_id ON push_tokens (user_id);

-- RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push tokens"
  ON push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens"
  ON push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
  ON push_tokens FOR DELETE
  USING (auth.uid() = user_id);
