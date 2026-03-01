-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ══════════════════════════════════════════════════════════════════════
-- Tables
-- ══════════════════════════════════════════════════════════════════════

-- Table: profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text check (role in ('student', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: resume_analysis
create table if not exists resume_analysis (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_text text,
  extracted_skills text,
  target_role text,
  analysis_score integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: assessment_results
create table if not exists assessment_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_score integer,
  personality_score integer,
  overall_score integer,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ══════════════════════════════════════════════════════════════════════
-- Migrations / Fixes (Ensuring ALL columns exist on ALL tables)
-- ══════════════════════════════════════════════════════════════════════

-- profiles: ensure all columns exist (table may have been created with different schema)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

-- resume_analysis: ensure all columns exist
ALTER TABLE resume_analysis ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE resume_analysis ADD COLUMN IF NOT EXISTS resume_text TEXT;
ALTER TABLE resume_analysis ADD COLUMN IF NOT EXISTS extracted_skills TEXT;
ALTER TABLE resume_analysis ADD COLUMN IF NOT EXISTS target_role TEXT;
ALTER TABLE resume_analysis ADD COLUMN IF NOT EXISTS analysis_score INTEGER;
ALTER TABLE resume_analysis ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

-- assessment_results: ensure all columns exist
ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS skill_score INTEGER;
ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS personality_score INTEGER;
ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS overall_score INTEGER;
ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

-- ══════════════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ══════════════════════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table resume_analysis enable row level security;
alter table assessment_results enable row level security;

-- profiles policies
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles for insert with check (id = auth.uid());
drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile" on profiles for select using (id = auth.uid());
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (id = auth.uid());

-- resume_analysis policies
drop policy if exists "Users can insert own resume" on resume_analysis;
create policy "Users can insert own resume" on resume_analysis for insert with check (user_id = auth.uid());
drop policy if exists "Users can read own resume" on resume_analysis;
create policy "Users can read own resume" on resume_analysis for select using (user_id = auth.uid());

-- assessment_results policies
drop policy if exists "Users can insert own assessment" on assessment_results;
create policy "Users can insert own assessment" on assessment_results for insert with check (user_id = auth.uid());
drop policy if exists "Users can update own assessment" on assessment_results;
create policy "Users can update own assessment" on assessment_results for update using (user_id = auth.uid());
drop policy if exists "Users can read own assessment" on assessment_results;
create policy "Users can read own assessment" on assessment_results for select using (user_id = auth.uid());
