-- Create payment_verifications table for admin verification
CREATE TABLE public.payment_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  loan_application_id UUID REFERENCES public.loan_applications(id),
  payment_method TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  admin_notes TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment verifications
CREATE POLICY "Users can view their own payment verifications"
ON public.payment_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own payment verifications
CREATE POLICY "Users can create their own payment verifications"
ON public.payment_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_payment_verifications_updated_at
  BEFORE UPDATE ON public.payment_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();