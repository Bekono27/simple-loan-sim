-- Create function to handle password reset
CREATE OR REPLACE FUNCTION public.handle_password_reset()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer set search_path = ''
AS $$
BEGIN
  -- Insert or update profile when user resets password
  INSERT INTO public.profiles (user_id, email, username, full_name, phone_number)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone_number', '')
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for password reset
DROP TRIGGER IF EXISTS on_auth_user_password_reset ON auth.users;
CREATE TRIGGER on_auth_user_password_reset
  AFTER UPDATE OF encrypted_password ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_password_reset();

-- Create function to handle new user creation  
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer set search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, username, full_name, phone_number, birth_date, register_number)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone_number', ''),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'birth_date')::date 
      ELSE NULL 
    END,
    COALESCE(NEW.raw_user_meta_data ->> 'register_number', '')
  );
  RETURN NEW;
END;
$$;

-- Update trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();