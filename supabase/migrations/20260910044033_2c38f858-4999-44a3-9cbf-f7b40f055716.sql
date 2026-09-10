CREATE POLICY "Authenticated users can view land images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'land-images');

CREATE POLICY "Users can upload their own land images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'land-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own land images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'land-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own land images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'land-images' AND auth.uid()::text = (storage.foldername(name))[1]);