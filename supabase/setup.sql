-- Create the profiles table first
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique,
    name text,
    display_name text,
    username text unique,
    bio text,
    avatar_url text,
    fitness_goals text[] default '{}',
    level integer default 1,
    stats jsonb default '{
        "workoutsCompleted": 0,
        "totalMinutes": 0,
        "streakDays": 0,
        "achievementsCount": 0,
        "followersCount": 0,
        "followingCount": 0
    }'::jsonb,
    achievements jsonb[] default '{}',
    recent_workouts jsonb[] default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
    on profiles for select
    using ( true );

create policy "Users can insert their own profile"
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update own profile"
    on profiles for update
    using ( auth.uid() = id );

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
    before update on public.profiles
    for each row
    execute procedure public.handle_updated_at();