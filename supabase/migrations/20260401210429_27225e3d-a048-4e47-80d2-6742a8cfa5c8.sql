-- Allow authenticated users to insert their own clients
CREATE POLICY "Users can insert their own clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own clients
CREATE POLICY "Users can update their own clients"
ON public.clients
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own clients
CREATE POLICY "Users can delete their own clients"
ON public.clients
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);