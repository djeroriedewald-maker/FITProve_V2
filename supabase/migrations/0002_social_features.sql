-- Create posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  content text,
  media_url text[],
  type text not null check (type in ('workout', 'achievement', 'general')),
  workout_id uuid references public.workouts,
  achievement_id uuid references public.badges,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  
  constraint post_type_validation check (
    (type = 'workout' and workout_id is not null and achievement_id is null) or
    (type = 'achievement' and achievement_id is not null and workout_id is null) or
    (type = 'general' and workout_id is null and achievement_id is null)
  )
);

-- Create comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  parent_id uuid references public.comments on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  likes_count integer not null default 0,
  
  constraint content_not_empty check (length(trim(content)) > 0)
);

-- Create likes table
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  post_id uuid references public.posts on delete cascade,
  comment_id uuid references public.comments on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint like_target_validation check (
    (post_id is not null and comment_id is null) or
    (comment_id is not null and post_id is null)
  ),
  unique (user_id, post_id),
  unique (user_id, comment_id)
);

-- Create followers table
create table public.followers (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles on delete cascade not null,
  following_id uuid references public.profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint no_self_follow check (follower_id != following_id),
  unique (follower_id, following_id)
);

-- Enable Row Level Security
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.followers enable row level security;

-- Create RLS policies
create policy "Posts are viewable by everyone"
  on posts for select
  using (true);

create policy "Users can create posts"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on posts for delete
  using (auth.uid() = user_id);

create policy "Comments are viewable by everyone"
  on comments for select
  using (true);

create policy "Users can create comments"
  on comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on comments for delete
  using (auth.uid() = user_id);

create policy "Likes are viewable by everyone"
  on likes for select
  using (true);

create policy "Users can create likes"
  on likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on likes for delete
  using (auth.uid() = user_id);

create policy "Followers are viewable by everyone"
  on followers for select
  using (true);

create policy "Users can follow others"
  on followers for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow others"
  on followers for delete
  using (auth.uid() = follower_id);

-- Create functions to manage likes count
create or replace function public.handle_post_like()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts
    set likes_count = likes_count + 1
    where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.posts
    set likes_count = likes_count - 1
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$;

create or replace function public.handle_comment_like()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.comments
    set likes_count = likes_count + 1
    where id = NEW.comment_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.comments
    set likes_count = likes_count - 1
    where id = OLD.comment_id;
    return OLD;
  end if;
  return null;
end;
$$;

-- Create function to manage comments count
create or replace function public.handle_comment_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts
    set comments_count = comments_count + 1
    where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.posts
    set comments_count = comments_count - 1
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$;

-- Create triggers for likes and comments count
create trigger handle_post_like_trigger
after insert or delete on public.likes
for each row
when (NEW.post_id is not null or OLD.post_id is not null)
execute function public.handle_post_like();

create trigger handle_comment_like_trigger
after insert or delete on public.likes
for each row
when (NEW.comment_id is not null or OLD.comment_id is not null)
execute function public.handle_comment_like();

create trigger handle_comment_count_trigger
after insert or delete on public.comments
for each row
execute function public.handle_comment_count();