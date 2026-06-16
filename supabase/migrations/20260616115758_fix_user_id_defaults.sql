/*
# Fix user_id columns with DEFAULT auth.uid()

1. Modified Tables
- `applied_recommendations`: user_id now has DEFAULT auth.uid() so inserts omitting user_id still satisfy RLS
- `consultation_schedules`: same default
- `quick_setup_templates`: same default
- `recommendation_templates`: same default

2. Security
- No policy changes. The previous migration already created proper auth.uid() = user_id policies.
- DEFAULT auth.uid() ensures .insert({ title }) works without the client threading user_id.

3. Important Notes
- This is a companion to the previous migration that added user_id columns and proper RLS policies.
- Without this default, any insert from an authenticated session that omits user_id would fail
  the WITH CHECK (auth.uid() = user_id) policy because user_id would be NULL.
*/

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'applied_recommendations' AND column_name = 'user_id') THEN
    ALTER TABLE public.applied_recommendations ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'consultation_schedules' AND column_name = 'user_id') THEN
    ALTER TABLE public.consultation_schedules ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quick_setup_templates' AND column_name = 'user_id') THEN
    ALTER TABLE public.quick_setup_templates ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recommendation_templates' AND column_name = 'user_id') THEN
    ALTER TABLE public.recommendation_templates ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
END $$;
