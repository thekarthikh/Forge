-- =============================================
-- FORGE — Supabase Database Schema
-- Paste this entire file into:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

create table if not exists profiles (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade unique not null,
  name         text not null default '',
  goal         text not null default '',
  is_pro       boolean not null default false,
  pro_expires_at timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists habits (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  emoji         text not null default '💪',
  reminder_time text not null default '08:00',
  frequency     text not null default 'daily',
  custom_days   int[],
  color         text,
  created_at    timestamptz not null default now()
);

create table if not exists habit_completions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  habit_id     uuid references habits(id) on delete cascade not null,
  date         text not null,
  completed_at timestamptz not null default now(),
  unique(habit_id, date)
);

create table if not exists tasks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  title        text not null,
  completed    boolean not null default false,
  due_date     text,
  completed_at timestamptz,
  recurring    text,
  tags         text[],
  notes        text,
  created_at   timestamptz not null default now()
);

create table if not exists priorities (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  date         text not null,
  title        text not null default '',
  completed    boolean not null default false,
  completed_at timestamptz,
  "order"      int not null default 0,
  unique(user_id, date, "order")
);

create table if not exists daily_scores (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references auth.users(id) on delete cascade not null,
  date                 text not null,
  score                int not null default 0,
  level                text not null default 'empty',
  priorities_completed int not null default 0,
  habits_completed     int not null default 0,
  tasks_completed      int not null default 0,
  unique(user_id, date)
);

create table if not exists earned_badges (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  badge_id   text not null,
  earned_at  timestamptz not null default now(),
  unique(user_id, badge_id)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table profiles        enable row level security;
alter table habits           enable row level security;
alter table habit_completions enable row level security;
alter table tasks            enable row level security;
alter table priorities       enable row level security;
alter table daily_scores     enable row level security;
alter table earned_badges    enable row level security;

-- Profiles
create policy "profiles_select" on profiles for select using (auth.uid() = user_id);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update" on profiles for update using (auth.uid() = user_id);
create policy "profiles_delete" on profiles for delete using (auth.uid() = user_id);

-- Habits
create policy "habits_all" on habits for all using (auth.uid() = user_id);

-- Habit completions
create policy "completions_all" on habit_completions for all using (auth.uid() = user_id);

-- Tasks
create policy "tasks_all" on tasks for all using (auth.uid() = user_id);

-- Priorities
create policy "priorities_all" on priorities for all using (auth.uid() = user_id);

-- Daily scores
create policy "scores_all" on daily_scores for all using (auth.uid() = user_id);

-- Earned badges
create policy "badges_all" on earned_badges for all using (auth.uid() = user_id);

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, name, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    now()
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
