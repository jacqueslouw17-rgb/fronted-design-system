-- Create profiles table for user information
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create organization profiles table
CREATE TABLE public.organization_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  company_name text,
  industry text,
  company_size text,
  hq_country text,
  website text,
  contact_name text,
  contact_email text,
  contact_phone text,
  default_currency text,
  payroll_frequency text,
  auto_tax_calc boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create localization settings table
CREATE TABLE public.localization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  operating_countries text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create mini rules table
CREATE TABLE public.mini_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rule_type text NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create integrations table
CREATE TABLE public.user_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  hr_system text,
  accounting_system text,
  banking_partner text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create pledge table
CREATE TABLE public.user_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  pledge_text text NOT NULL,
  accepted_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mini_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pledges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for organization_profiles
CREATE POLICY "Users can view their own org profile"
  ON public.organization_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own org profile"
  ON public.organization_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own org profile"
  ON public.organization_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for localization_settings
CREATE POLICY "Users can view their own localization"
  ON public.localization_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own localization"
  ON public.localization_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own localization"
  ON public.localization_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mini_rules
CREATE POLICY "Users can view their own rules"
  ON public.mini_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rules"
  ON public.mini_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rules"
  ON public.mini_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rules"
  ON public.mini_rules FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_integrations
CREATE POLICY "Users can view their own integrations"
  ON public.user_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON public.user_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
  ON public.user_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_pledges
CREATE POLICY "Users can view their own pledge"
  ON public.user_pledges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pledge"
  ON public.user_pledges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_profiles_updated_at
  BEFORE UPDATE ON public.organization_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_localization_settings_updated_at
  BEFORE UPDATE ON public.localization_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mini_rules_updated_at
  BEFORE UPDATE ON public.mini_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();