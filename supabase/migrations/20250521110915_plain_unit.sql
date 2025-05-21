/*
  # Create translations table

  1. New Tables
    - `translations`
      - `id` (uuid, primary key)
      - `pdf_text` (text)
      - `template_text` (text)
      - `target_language` (text)
      - `translated_content` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `translations` table
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pdf_text text NOT NULL,
  template_text text NOT NULL,
  target_language text NOT NULL,
  translated_content text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own translations"
  ON translations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create translations"
  ON translations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own translations"
  ON translations
  FOR UPDATE
  TO authenticated
  USING (true);