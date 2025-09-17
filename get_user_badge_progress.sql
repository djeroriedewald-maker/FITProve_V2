-- Haal badge progress voor een gebruiker op
create or replace function get_user_badge_progress(uid uuid)
returns table (
  badge_id uuid,
  progress integer,
  target integer
)
language sql
as $$
  select badge_id, progress, target from badge_progress where user_id = uid;
$$;
