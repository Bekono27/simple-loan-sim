-- Add email column to profiles table to enable username login
ALTER TABLE public.profiles 
ADD COLUMN email TEXT;

-- Create index on username for faster lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Update the handle_new_user function to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, email, birth_date, register_number, phone_number)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'birth_date', NULL),
    COALESCE(NEW.raw_user_meta_data->>'register_number', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;