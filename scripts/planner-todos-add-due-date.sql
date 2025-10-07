-- Migration: Add due_date to planner_todos
alter table planner_todos add column if not exists due_date date;
