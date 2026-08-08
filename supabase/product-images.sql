-- Ejecutar una sola vez en el SQL Editor del proyecto de Supabase.
-- El bucket es público para lectura; las escrituras siguen protegidas por RLS.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "active admins can upload product images" on storage.objects;
create policy "active admins can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.id = (select auth.uid())
      and admin_users.is_active = true
  )
);

drop policy if exists "active admins can update product images" on storage.objects;
create policy "active admins can update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.id = (select auth.uid())
      and admin_users.is_active = true
  )
)
with check (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.id = (select auth.uid())
      and admin_users.is_active = true
  )
);

drop policy if exists "active admins can delete product images" on storage.objects;
create policy "active admins can delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.id = (select auth.uid())
      and admin_users.is_active = true
  )
);
