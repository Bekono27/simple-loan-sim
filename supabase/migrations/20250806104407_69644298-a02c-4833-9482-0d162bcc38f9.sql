-- Create admin functions to bypass RLS for admin operations
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

-- Create function to get user activity for admin
CREATE OR REPLACE FUNCTION admin_get_user_activity(target_user_id UUID)
RETURNS TABLE (
  loans JSON,
  payments JSON
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (SELECT COALESCE(json_agg(row_to_json(l)), '[]'::json) FROM loan_applications l WHERE l.user_id = target_user_id) as loans,
    (SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json) FROM payment_verifications p WHERE p.user_id = target_user_id) as payments;
$$;

-- Grant execute permissions to authenticated users (admins can call these through the app)
GRANT EXECUTE ON FUNCTION admin_get_all_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_loan_applications() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_payment_verifications() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_user_activity(UUID) TO authenticated;