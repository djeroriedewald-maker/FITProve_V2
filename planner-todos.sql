-- Migration: Create planner_todos table for user-specific to-dos/goals
create table if not exists planner_todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  content text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: Only allow users to access their own todos
enable row level security on planner_todos;
create policy "Users can view their own todos" on planner_todos for select using (auth.uid() = user_id);
create policy "Users can insert their own todos" on planner_todos for insert with check (auth.uid() = user_id);
create policy "Users can update their own todos" on planner_todos for update using (auth.uid() = user_id);
create policy "Users can delete their own todos" on planner_todos for delete using (auth.uid() = user_id);
