-- Create an admin user in auth.users (this will trigger the profile creation)
-- First, let's create a function to safely create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_username TEXT DEFAULT 'AdminBT',
  admin_full_name TEXT DEFAULT 'System Administrator'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Insert admin user into auth.users (simplified approach)
  -- In a real scenario, this would be done through Supabase admin API
  
  -- Check if admin already exists in profiles
  SELECT user_id INTO admin_user_id 
  FROM public.profiles 
  WHERE email = admin_email AND role = 'admin'
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    -- Generate a UUID for the admin user
    admin_user_id := gen_random_uuid();
    
    -- Create admin profile directly
    INSERT INTO public.profiles (
      user_id, 
      email, 
      username, 
      full_name, 
      role,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      admin_email,
      admin_username,
      admin_full_name,
      'admin',
      now(),
      now()
    );
  END IF;
  
  RETURN admin_user_id;
END;
$$;

-- Create admin user
SELECT create_admin_user('admin@factloan.mn', 'fctln!@#2025', 'AdminBT', 'System Administrator');

-- Create a function to bypass RLS for admin operations
CREATE OR REPLACE FUNCTION admin_get_all_profiles()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  register_number TEXT,
  birth_date DATE,
  role app_role,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.username,
    p.full_name,
    p.email,
    p.phone_number,
    p.register_number,
    p.birth_date,
    p.role,
    p.created_at,
    p.updated_at
  FROM profiles p
  ORDER BY p.created_at DESC;
$$;

-- Create function to get all loan applications for admins
CREATE OR REPLACE FUNCTION admin_get_all_loan_applications()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  amount NUMERIC,
  status TEXT,
  payment_status TEXT,
  eligibility_result TEXT,
  bank_statement_filename TEXT,
  bank_statement_url TEXT,
  interest_rate NUMERIC,
  max_loan_amount NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    l.id,
    l.user_id,
    l.amount,
    l.status,
    l.payment_status,
    l.eligibility_result,
    l.bank_statement_filename,
    l.bank_statement_url,
    l.interest_rate,
    l.max_loan_amount,
    l.created_at,
    l.updated_at
  FROM loan_applications l
  ORDER BY l.created_at DESC;
$$;

-- Create function to get all payment verifications for admins
CREATE OR REPLACE FUNCTION admin_get_all_payment_verifications()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  loan_application_id UUID,
  amount INTEGER,
  payment_method TEXT,
  reference_number TEXT,
  payment_date TIMESTAMPTZ,
  status TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  admin_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pv.id,
    pv.user_id,
    pv.loan_application_id,
    pv.amount,
    pv.payment_method,
    pv.reference_number,
    pv.payment_date,
    pv.status,
    pv.verified_at,
    pv.verified_by,
    pv.admin_notes,
    pv.created_at,
    pv.updated_at
  FROM payment_verifications pv
  ORDER BY pv.created_at DESC;
$$;

-- Create function to authenticate admin using email/password
CREATE OR REPLACE FUNCTION admin_authenticate(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  email TEXT,
  role app_role
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple password check for demo purposes
  -- In production, this should use proper password hashing
  IF admin_email = 'admin@factloan.mn' AND admin_password = 'fctln!@#2025' THEN
    RETURN QUERY
    SELECT 
      p.user_id,
      p.username,
      p.full_name,
      p.email,
      p.role
    FROM profiles p
    WHERE p.email = admin_email AND p.role = 'admin'
    LIMIT 1;
  END IF;
END;
$$;