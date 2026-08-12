create schema if not exists private;
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profils (id, nom_complet, role)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'nom_complet'), ''), split_part(new.email, '@', 1)), 'lecture_seule');
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();
grant usage on schema public to authenticated;
grant select on public.ministeres, public.secteurs, public.regions, public.departements, public.communes, public.profils, public.projets, public.inspections, public.photos, public.alertes to authenticated;
