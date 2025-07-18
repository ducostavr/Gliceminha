/*
  # Criar tabela de vínculos guardião-paciente

  1. Nova Tabela
    - `guardian_patient_links`
      - `id` (uuid, primary key)
      - `guardian_id` (uuid, foreign key para auth.users)
      - `patient_id` (uuid, foreign key para auth.users)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `guardian_patient_links`
    - Políticas para guardiões verem seus vínculos
    - Política para guardiões verem registros de pacientes vinculados
*/

-- Criar tabela de vínculos guardião-paciente
CREATE TABLE IF NOT EXISTS guardian_patient_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(guardian_id, patient_id)
);

-- Habilitar RLS
ALTER TABLE guardian_patient_links ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Guardiões podem ver seus vínculos"
  ON guardian_patient_links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = guardian_id);

CREATE POLICY "Guardiões podem criar vínculos"
  ON guardian_patient_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = guardian_id);

-- Política adicional para guardiões verem registros de pacientes vinculados
CREATE POLICY "Guardiões podem ver registros de pacientes vinculados"
  ON glucose_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM guardian_patient_links 
      WHERE guardian_id = auth.uid() AND patient_id = glucose_records.user_id
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS guardian_patient_links_guardian_id_idx ON guardian_patient_links(guardian_id);
CREATE INDEX IF NOT EXISTS guardian_patient_links_patient_id_idx ON guardian_patient_links(patient_id);