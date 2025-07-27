/*
  # Add storage policies for prize images

  1. Security Changes
    - Enable storage policies for the prizes bucket
    - Add policies to allow authenticated users to:
      - Upload images to prize-images folder
      - Read images from prize-images folder
*/

-- Create storage policies for the prizes bucket
BEGIN;

-- Policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload prize images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'prizes' AND
  (storage.foldername(name))[1] = 'prize-images'
);

-- Policy to allow authenticated users to read images
CREATE POLICY "Allow authenticated users to read prize images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'prizes' AND
  (storage.foldername(name))[1] = 'prize-images'
);

COMMIT;