-- Add user_id columns to user-scoped tables
ALTER TABLE public.applied_recommendations ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.consultation_schedules ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- quick_setup_templates and recommendation_templates are system seed data
-- They don't need user_id; their INSERT/UPDATE should be restricted to service role
-- For now, add user_id so admin users can manage them
ALTER TABLE public.quick_setup_templates ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.recommendation_templates ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Backfill existing rows with a placeholder (null is fine - these are system rows)
-- Rows with null user_id are system-managed seed data

-- ============================================================
-- Drop all insecure policies (USING true / WITH CHECK true)
-- ============================================================

-- applied_recommendations
DROP POLICY IF EXISTS "Anyone can read applied recommendations" ON public.applied_recommendations;
DROP POLICY IF EXISTS "Authenticated users can insert applied recommendations" ON public.applied_recommendations;

-- consultation_schedules
DROP POLICY IF EXISTS "Anyone can read consultation schedules" ON public.consultation_schedules;
DROP POLICY IF EXISTS "Authenticated users can delete consultation schedules" ON public.consultation_schedules;
DROP POLICY IF EXISTS "Authenticated users can insert consultation schedules" ON public.consultation_schedules;
DROP POLICY IF EXISTS "Authenticated users can update consultation schedules" ON public.consultation_schedules;

-- quick_setup_templates
DROP POLICY IF EXISTS "Anyone can read quick setup templates" ON public.quick_setup_templates;
DROP POLICY IF EXISTS "Authenticated users can insert quick setup templates" ON public.quick_setup_templates;
DROP POLICY IF EXISTS "Authenticated users can update quick setup templates" ON public.quick_setup_templates;

-- recommendation_templates
DROP POLICY IF EXISTS "Anyone can read recommendation templates" ON public.recommendation_templates;
DROP POLICY IF EXISTS "Authenticated users can insert recommendation templates" ON public.recommendation_templates;
DROP POLICY IF EXISTS "Authenticated users can update recommendation templates" ON public.recommendation_templates;

-- ============================================================
-- Create proper RLS policies with auth.uid() = user_id
-- ============================================================

-- applied_recommendations: users see and manage their own applied recs
-- System rows (user_id IS NULL) are readable by all authenticated users
CREATE POLICY "select_applied_recommendations" ON public.applied_recommendations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "insert_own_applied_recommendations" ON public.applied_recommendations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_applied_recommendations" ON public.applied_recommendations
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "delete_own_applied_recommendations" ON public.applied_recommendations
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- consultation_schedules: users see and manage their own schedules
CREATE POLICY "select_own_consultation_schedules" ON public.consultation_schedules
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "insert_own_consultation_schedules" ON public.consultation_schedules
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_consultation_schedules" ON public.consultation_schedules
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "delete_own_consultation_schedules" ON public.consultation_schedules
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- quick_setup_templates: read-only for users (system seed data), owners can manage
CREATE POLICY "select_quick_setup_templates" ON public.quick_setup_templates
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "insert_own_quick_setup_templates" ON public.quick_setup_templates
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_quick_setup_templates" ON public.quick_setup_templates
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- recommendation_templates: read-only for users (system seed data), owners can manage
CREATE POLICY "select_recommendation_templates" ON public.recommendation_templates
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "insert_own_recommendation_templates" ON public.recommendation_templates
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_recommendation_templates" ON public.recommendation_templates
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
