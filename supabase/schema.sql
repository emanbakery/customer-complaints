-- Run this SQL in your Supabase SQL editor to create the required table and storage bucket.

-- 1. Complaints table
create table if not exists complaints (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  shop_name text not null,
  mobile text not null,
  description text not null,
  photo_url text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved')),
  admin_notes text
);

-- 2. Enable Row Level Security
alter table complaints enable row level security;

-- 3. Allow anyone (public) to INSERT a new complaint
create policy "Public can submit complaints"
  on complaints for insert
  with check (true);

-- 4. Only authenticated users (admin) can SELECT / UPDATE
create policy "Admins can view all complaints"
  on complaints for select
  using (auth.role() = 'authenticated');

create policy "Admins can update complaints"
  on complaints for update
  using (auth.role() = 'authenticated');

-- 5. Storage bucket for complaint photos
insert into storage.buckets (id, name, public)
values ('complaint-photos', 'complaint-photos', true)
on conflict do nothing;

-- 6. Allow public uploads to the storage bucket
create policy "Public can upload complaint photos"
  on storage.objects for insert
  with check (bucket_id = 'complaint-photos');

create policy "Public can view complaint photos"
  on storage.objects for select
  using (bucket_id = 'complaint-photos');
