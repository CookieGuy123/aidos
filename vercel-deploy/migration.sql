-- Run this SQL in your Supabase dashboard (SQL Editor) once before deploying.
-- It creates the tables needed by the Admissions Atlas API.

create table if not exists scholarships (
  id text primary key,
  name text not null,
  organization text not null default '',
  amount text not null default '',
  "amountNumeric" double precision not null default 0,
  deadline text not null default '',
  "studentLevel" text not null default 'both',
  "ageFilter" text not null default 'All eligible',
  "isFree" boolean not null default true,
  "scamFlag" boolean not null default false,
  "scamReason" text not null default '',
  requirements jsonb not null default '[]',
  "isVerified" boolean not null default false,
  "sourceUrl" text not null default '',
  "fieldOfStudy" text not null default 'Any',
  "originalQuery" text not null default '',
  "isNew" boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists internships (
  id text primary key,
  title text not null,
  company text not null default '',
  location text not null default '',
  type text not null default 'Paid',
  deadline text not null default '',
  "studentLevel" text not null default 'all',
  description text not null default '',
  requirements jsonb not null default '[]',
  "isVerified" boolean not null default false,
  "scamFlag" boolean not null default false,
  "scamReason" text not null default '',
  "sourceUrl" text not null default '',
  "fieldOfStudy" text not null default 'Any',
  "isNew" boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (optional, safe defaults)
alter table scholarships enable row level security;
alter table internships enable row level security;

-- Allow anon and service_role full access (service key is used server-side)
create policy "Service role full access on scholarships"
  on scholarships for all to service_role using (true) with check (true);
create policy "Service role full access on internships"
  on internships for all to service_role using (true) with check (true);
create policy "Anon read scholarships"
  on scholarships for select to anon using (true);
create policy "Anon read internships"
  on internships for select to anon using (true);
