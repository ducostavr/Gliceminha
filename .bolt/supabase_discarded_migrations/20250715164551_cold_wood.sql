/*
  # Criar tabela de registros de glicose

  1. Nova Tabela
    - `glucose_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para auth.users)
      - `glucose_level` (integer, nível de glicose)
      - `insulin_units` (numeric, unidades de insulina - opcional)
      - `hba1c` (numeric, hemoglobina glicada - opcional)
      - `note` (text, observação - opcional)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `glucose_records`
    - Políticas para usuários acessarem apenas seus próprios registros
    - Guardião pode ver registros de pacientes vinculados
*/

-- Criar tabela de registros de glicose
CREATE TABLE IF NOT EXISTS glucose_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  glucose_level integer NOT NULL CHECK (glucose_level >= 40 AND glucose_level <= 600),
  insulin_units numeric(5,1) CHECK (insulin_units >= 0),
  hba1c numeric(4,1) CHECK (hba1c >= 0 AND hba1c <= 20),
  note text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE glucose_records ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios registros"
  ON glucose_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros"
  ON glucose_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros"
  ON glucose_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros"
  ON glucose_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS glucose_records_user_id_idx ON glucose_records(user_id);
CREATE INDEX IF NOT EXISTS glucose_records_created_at_idx ON glucose_records(created_at DESC);