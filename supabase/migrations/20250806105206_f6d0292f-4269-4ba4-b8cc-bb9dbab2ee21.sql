-- Fix constraint issue and update admin functions
-- First, check current constraint on loan_applications table
SELECT constraint_name, check_clause, table_name
FROM information_schema.check_constraints 
WHERE table_name = 'loan_applications' AND constraint_name LIKE '%payment_status%';

-- Update the admin payment verification function to handle RLS properly
CREATE OR REPLACE FUNCTION public.admin_update_payment_verification(
  payment_id uuid,
  new_status text,
  notes text DEFAULT NULL,
  admin_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Update payment verification
  UPDATE payment_verifications 
  SET 
    status = new_status,
    admin_notes = notes,
    verified_by = admin_id,
    verified_at = CASE WHEN new_status IN ('verified', 'rejected') THEN now() ELSE verified_at END,
    updated_at = now()
  WHERE id = payment_id;
  
  -- Update related loan application if exists
  UPDATE loan_applications 
  SET 
    payment_status = CASE 
      WHEN new_status = 'verified' THEN 'paid'
      WHEN new_status = 'rejected' THEN 'unpaid'
      ELSE payment_status
    END,
    status = CASE 
      WHEN new_status = 'verified' THEN 'payment_verified'
      WHEN new_status = 'rejected' THEN 'payment_rejected'  
      ELSE status
    END,
    updated_at = now()
  WHERE id = (SELECT loan_application_id FROM payment_verifications WHERE id = payment_id);
  
  SELECT true;
$$;