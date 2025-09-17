-- Eerst bestaande tabellen verwijderen (let op: data gaat verloren!)
DROP TABLE IF EXISTS public.badge_criteria CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;

CREATE TABLE IF NOT EXISTS public.badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    icon_url text NOT NULL,
    type text NOT NULL, -- bijv. 'achievement', 'milestone', etc.
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE,
    unlocked_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.badge_criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE,
    event_type text NOT NULL, -- bijv. 'workout_completed', 'account_created', etc.
    event_data jsonb,         -- optioneel: extra criteria
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.badges
    FOR SELECT USING (true);

ALTER TABLE public.badge_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.badge_criteria
    FOR SELECT USING (true);

