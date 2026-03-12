-- Tabela do persystencji kalendarza treści
-- Uruchom w Supabase SQL Editor

create table if not exists calendar_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  topic text not null default '',
  platform text not null default 'facebook',
  generated boolean not null default false,
  post_text text,
  hashtags jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table calendar_topics enable row level security;

create policy "Uzytkownik widzi tylko swoje tematy"
  on calendar_topics for all
  using (user_id = auth.uid());

create index if not exists calendar_topics_user_date
  on calendar_topics (user_id, date);

create or replace function update_calendar_topics_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger calendar_topics_updated_at
  before update on calendar_topics
  for each row execute procedure update_calendar_topics_updated_at();
