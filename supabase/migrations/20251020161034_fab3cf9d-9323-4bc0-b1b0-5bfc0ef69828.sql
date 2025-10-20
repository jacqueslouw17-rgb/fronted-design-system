-- Add DELETE policies for user data tables to enable proper data lifecycle management

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own organization profile
CREATE POLICY "Users can delete their own org profile"
ON public.organization_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own localization settings
CREATE POLICY "Users can delete their own localization"
ON public.localization_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own integrations
CREATE POLICY "Users can delete their own integrations"
ON public.user_integrations
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own pledges
CREATE POLICY "Users can delete their own pledges"
ON public.user_pledges
FOR DELETE
USING (auth.uid() = user_id);