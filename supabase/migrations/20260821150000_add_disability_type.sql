ALTER TABLE public.profiles
ADD COLUMN disability_type TEXT
CHECK (
  disability_type IS NULL
  OR disability_type IN ('intellectual', 'visual', 'hearing', 'motor', 'neurodivergent', 'other')
);

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    education_level,
    has_disability,
    disability_type,
    disability_description
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'education_level', ''),
    COALESCE((NEW.raw_user_meta_data->>'has_disability')::boolean, false),
    NULLIF(NEW.raw_user_meta_data->>'disability_type', ''),
    NULLIF(NEW.raw_user_meta_data->>'disability_description', '')
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
