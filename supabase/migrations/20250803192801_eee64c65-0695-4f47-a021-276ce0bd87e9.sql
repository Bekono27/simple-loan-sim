-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  birth_date DATE,
  register_number TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create loan applications table
CREATE TABLE public.loan_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  bank_statement_url TEXT,
  bank_statement_filename TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
  eligibility_result TEXT,
  max_loan_amount DECIMAL(15,2),
  interest_rate DECIMAL(5,2),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for loan applications
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for loan applications
CREATE POLICY "Users can view their own loan applications" 
ON public.loan_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loan applications" 
ON public.loan_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loan applications" 
ON public.loan_applications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create P2P loans table
CREATE TABLE public.p2p_loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'matched', 'active', 'completed', 'defaulted')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for P2P loans
ALTER TABLE public.p2p_loans ENABLE ROW LEVEL SECURITY;

-- Create policies for P2P loans
CREATE POLICY "Users can view all available P2P loans" 
ON public.p2p_loans 
FOR SELECT 
USING (status = 'available' OR lender_id = auth.uid() OR borrower_id = auth.uid());

CREATE POLICY "Users can create P2P loan offers" 
ON public.p2p_loans 
FOR INSERT 
WITH CHECK (auth.uid() = lender_id);

CREATE POLICY "Users can update their own P2P loans" 
ON public.p2p_loans 
FOR UPDATE 
USING (auth.uid() = lender_id OR auth.uid() = borrower_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at
BEFORE UPDATE ON public.loan_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_p2p_loans_updated_at
BEFORE UPDATE ON public.p2p_loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for bank statements
INSERT INTO storage.buckets (id, name, public) VALUES ('bank-statements', 'bank-statements', false);

-- Create storage policies
CREATE POLICY "Users can upload their own bank statements" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'bank-statements' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own bank statements" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bank-statements' AND auth.uid()::text = (storage.foldername(name))[1]);