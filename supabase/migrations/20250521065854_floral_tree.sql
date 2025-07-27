/*
  # Initial schema setup for Lucky Draw System

  1. New Tables
    - `prizes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text, nullable)
      - `image` (text, nullable)
      - `probability` (numeric)
      - `position` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `prize_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `prize_id` (uuid, foreign key)
      - `is_used` (boolean)
      - `used_at` (timestamp, nullable)
      - `used_by` (uuid, nullable)
      - `created_at` (timestamp)
    
    - `settings`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, nullable)
      - `button_text` (text)
      - `background_image` (text, nullable)
      - `background_music` (text, nullable)
      - `theme` (text)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create prizes table
CREATE TABLE IF NOT EXISTS prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image text,
  probability numeric NOT NULL CHECK (probability >= 0 AND probability <= 100),
  position integer NOT NULL CHECK (position >= 1 AND position <= 12),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create prize_codes table
CREATE TABLE IF NOT EXISTS prize_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  prize_id uuid NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  is_used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  used_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  button_text text NOT NULL,
  background_image text,
  background_music text,
  theme text NOT NULL DEFAULT 'default',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to prizes" ON prizes
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage prizes" ON prizes
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage prize codes" ON prize_codes
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow public read access to settings" ON settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage settings" ON settings
  FOR ALL TO authenticated USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_prizes_updated_at
  BEFORE UPDATE ON prizes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();