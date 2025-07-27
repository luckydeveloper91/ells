/*
  # Add missing columns and fix schema issues

  1. Changes
    - Add `isActive` column to `prizes` table
    - Ensure `settings` table exists with correct schema

  2. Security
    - Maintain existing RLS policies
*/

-- Add isActive column to prizes table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'prizes' 
    AND column_name = 'isactive'
  ) THEN
    ALTER TABLE prizes ADD COLUMN isactive boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Lucky Prize Draw',
  description text,
  button_text text NOT NULL DEFAULT 'SPIN',
  background_image text,
  background_music text,
  theme text NOT NULL DEFAULT 'default',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for settings table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow public read access to settings'
  ) THEN
    CREATE POLICY "Allow public read access to settings" ON settings
      FOR SELECT TO public USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow authenticated users to manage settings'
  ) THEN
    CREATE POLICY "Allow authenticated users to manage settings" ON settings
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;