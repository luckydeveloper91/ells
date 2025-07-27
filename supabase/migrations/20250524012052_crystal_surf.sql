/*
  # Set up storage buckets for media files

  1. New Storage Buckets
    - `prizes` bucket for prize images
    - `system` bucket for system assets (background images, sounds)

  2. Security
    - Enable public read access
    - Restrict write access to authenticated users
    - Set up folder-based organization
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('prizes', 'prizes', true),
  ('system', 'system', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for prizes bucket
CREATE POLICY "Allow public read access for prizes bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'prizes');

CREATE POLICY "Allow authenticated users to upload prize images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'prizes' AND
  (storage.foldername(name))[1] IN ('prize-images')
);

-- Set up storage policies for system bucket
CREATE POLICY "Allow public read access for system bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'system');

CREATE POLICY "Allow authenticated users to upload system files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'system' AND
  (storage.foldername(name))[1] IN ('backgrounds', 'sounds')
);