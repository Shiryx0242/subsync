-- ==============================================================================
-- SubSync Database Migration
-- Migration 001: Create Subscriptions Table with Row Level Security (RLS)
-- ==============================================================================

-- 1. Create subscriptions table
create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  price numeric not null,
  billing_date text not null, -- format: YYYY-MM-DD
  brand_color text not null,
  category text not null,
  logo text,
  cycle text default 'monthly',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.subscriptions enable row level security;

-- 3. RLS Policies (Users can only access their own subscriptions)
create policy "Users can view own subscriptions"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.subscriptions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on public.subscriptions
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on public.subscriptions
  for delete
  using (auth.uid() = user_id);

-- 4. Create Indexes for High Performance Querying
create index if not exists subscriptions_user_id_idx
  on public.subscriptions(user_id);

create index if not exists subscriptions_billing_date_idx
  on public.subscriptions(billing_date);

-- 5. Auto-update `updated_at` trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();
