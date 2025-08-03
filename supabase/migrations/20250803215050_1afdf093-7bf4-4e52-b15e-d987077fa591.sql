-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role public.app_role NOT NULL DEFAULT 'user';

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = $1
      AND profiles.role = 'admin'
  );
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Update RLS policies for admin access to all tables

-- Profiles table - admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

-- Loan applications - admins can view all
CREATE POLICY "Admins can view all loan applications" ON public.loan_applications
FOR SELECT TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

-- Payment verifications - admins can view and update all
CREATE POLICY "Admins can view all payment verifications" ON public.payment_verifications
FOR SELECT TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can update payment verifications" ON public.payment_verifications
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- P2P loans - admins can view all
CREATE POLICY "Admins can view all p2p loans" ON public.p2p_loans
FOR SELECT TO authenticated
USING (public.is_admin() OR lender_id = auth.uid() OR borrower_id = auth.uid() OR status = 'available');

-- Create audit log table for admin actions
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log
FOR SELECT TO authenticated
USING (public.is_admin());

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  table_name text DEFAULT NULL,
  record_id uuid DEFAULT NULL,
  action_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.is_admin() THEN
    INSERT INTO public.admin_audit_log (admin_user_id, action, target_table, target_id, details)
    VALUES (auth.uid(), action_type, table_name, record_id, action_details);
  END IF;
END;
$$;