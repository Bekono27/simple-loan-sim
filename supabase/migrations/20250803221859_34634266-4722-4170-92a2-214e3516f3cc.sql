-- Add credit score fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN credit_score integer DEFAULT 0,
ADD COLUMN score_updated_at timestamp with time zone,
ADD COLUMN score_updated_by uuid REFERENCES auth.users(id);

-- Create policy for admins to update credit scores
CREATE POLICY "Admins can update credit scores" 
ON public.profiles 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());