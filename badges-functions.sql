-- Haal alle actieve badges op
create or replace function get_active_badges()
returns setof badges
language sql
as $$
  select * from badges where is_active = true order by "order" nulls last, created_at;
$$;

-- Haal badges van een gebruiker op
create or replace function get_user_badges(uid uuid)
returns setof user_badges
language sql
as $$
  select * from user_badges where user_id = uid;
$$;

-- Ken een badge toe aan een gebruiker
create or replace function award_badge(uid uuid, badge uuid, note text default null)
returns void
language plpgsql
as $$
begin
  insert into user_badges(user_id, badge_id, achieved_at, note)
  values (uid, badge, now(), note)
  on conflict (user_id, badge_id) do nothing;
end;
$$;

-- Update badge progress
create or replace function update_badge_progress(uid uuid, badge uuid, progress int, target int default null)
returns void
language plpgsql
as $$
begin
  insert into badge_progress(user_id, badge_id, progress, target, last_updated)
  values (uid, badge, progress, target, now())
  on conflict (user_id, badge_id) do update set progress = excluded.progress, target = excluded.target, last_updated = now();
end;
$$;

-- Voeg een log toe
create or replace function log_badge_event(uid uuid, badge uuid, event text, details text default null)
returns void
language plpgsql
as $$
begin
  insert into badge_logs(user_id, badge_id, event, details, created_at)
  values (uid, badge, event, details, now());
end;
$$;
