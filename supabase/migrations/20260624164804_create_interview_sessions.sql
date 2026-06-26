/*
# Create interview_sessions table

1. New Tables
- `interview_sessions`
  - `id` (uuid, primary key)
  - `candidate_name` (text)
  - `round_type` (text, either 'technical' or 'hr')
  - `questions` (jsonb, array of question strings)
  - `evaluations` (jsonb, array of evaluation objects)
  - `average_confidence` (integer)
  - `status` (text: idle, live, completed)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

2. Security
- Enable RLS on `interview_sessions`.
- Allow anon + authenticated CRUD because this is a single-tenant app without auth requirements.
*/

CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_name text NOT NULL DEFAULT 'Candidate',
  round_type text NOT NULL DEFAULT 'technical',
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  evaluations jsonb NOT NULL DEFAULT '[]'::jsonb,
  average_confidence integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'idle',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sessions" ON interview_sessions;
CREATE POLICY "anon_select_sessions" ON interview_sessions FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON interview_sessions;
CREATE POLICY "anon_insert_sessions" ON interview_sessions FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON interview_sessions;
CREATE POLICY "anon_update_sessions" ON interview_sessions FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON interview_sessions;
CREATE POLICY "anon_delete_sessions" ON interview_sessions FOR DELETE
TO anon, authenticated USING (true);
