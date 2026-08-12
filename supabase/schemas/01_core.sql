create extension if not exists postgis with schema extensions;

create type public.niveau_risque as enum ('normal', 'surveillance', 'critique');
create type public.role_app as enum ('super_admin', 'admin_ministere', 'directeur', 'analyste', 'inspecteur', 'lecture_seule');

create table public.ministeres (id uuid primary key default gen_random_uuid(), nom text not null unique, sigle text not null unique, description text);
create table public.secteurs (id uuid primary key default gen_random_uuid(), nom text not null unique, description text);
create table public.regions (id uuid primary key default gen_random_uuid(), nom text not null unique, code text unique, geom extensions.geometry(MultiPolygon,4326));
create table public.departements (id uuid primary key default gen_random_uuid(), region_id uuid not null references public.regions on delete restrict, nom text not null, geom extensions.geometry(MultiPolygon,4326), unique(region_id,nom));
create table public.communes (id uuid primary key default gen_random_uuid(), departement_id uuid not null references public.departements on delete restrict, nom text not null, geom extensions.geometry(MultiPolygon,4326), unique(departement_id,nom));
create table public.profils (id uuid primary key references auth.users on delete cascade, nom_complet text not null, role public.role_app not null default 'lecture_seule', ministere_id uuid references public.ministeres, actif boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.projets (
 id uuid primary key default gen_random_uuid(), code_projet text not null unique, nom text not null, description text,
 ministere_id uuid not null references public.ministeres, secteur_id uuid not null references public.secteurs,
 region_id uuid references public.regions, departement_id uuid references public.departements, commune_id uuid references public.communes,
 entreprise text, cout_total numeric(18,2) not null check(cout_total>=0), budget_engage numeric(18,2) not null check(budget_engage>=0), montant_decaisse numeric(18,2) not null default 0 check(montant_decaisse>=0),
 avancement_physique numeric(5,2) not null default 0 check(avancement_physique between 0 and 100), avancement_financier numeric(5,2) not null default 0 check(avancement_financier between 0 and 100),
 date_debut date, date_fin_prevue date, date_fin_reelle date, statut text not null default 'planifie', score_risque smallint not null default 0 check(score_risque between 0 and 100), niveau_risque public.niveau_risque not null default 'normal',
 geom extensions.geometry(Point,4326), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.inspections (id uuid primary key default gen_random_uuid(), projet_id uuid not null references public.projets on delete cascade, date_inspection timestamptz not null, inspecteur_id uuid references public.profils, observations text, avancement_constate numeric(5,2) check(avancement_constate between 0 and 100), geom extensions.geometry(Point,4326), created_at timestamptz not null default now());
create table public.photos (id uuid primary key default gen_random_uuid(), projet_id uuid not null references public.projets on delete cascade, inspection_id uuid references public.inspections on delete set null, chemin_stockage text not null, geom extensions.geometry(Point,4326), prise_le timestamptz, description text);
create table public.alertes (id uuid primary key default gen_random_uuid(), projet_id uuid not null references public.projets on delete cascade, type text not null, severite public.niveau_risque not null, message text not null, statut text not null default 'ouverte', date_creation timestamptz not null default now());
create table public.historique (id bigint generated always as identity primary key, projet_id uuid references public.projets on delete set null, utilisateur_id uuid references public.profils, action text not null, donnees jsonb not null default '{}'::jsonb, date_action timestamptz not null default now());

create index projets_ministere_idx on public.projets(ministere_id);
create index projets_region_idx on public.projets(region_id);
create index projets_risque_idx on public.projets(niveau_risque) where niveau_risque <> 'normal';
create index projets_geom_idx on public.projets using gist(geom);
create index inspections_projet_date_idx on public.inspections(projet_id,date_inspection desc);
create index inspections_inspecteur_idx on public.inspections(inspecteur_id);
create index photos_projet_idx on public.photos(projet_id);
create index photos_inspection_idx on public.photos(inspection_id);
create index alertes_projet_statut_idx on public.alertes(projet_id,statut);
create index profils_ministere_idx on public.profils(ministere_id);
create index projets_secteur_idx on public.projets(secteur_id);
create index projets_departement_idx on public.projets(departement_id);
create index projets_commune_idx on public.projets(commune_id);
create index historique_projet_idx on public.historique(projet_id);
create index historique_utilisateur_idx on public.historique(utilisateur_id);

alter table public.ministeres enable row level security; alter table public.secteurs enable row level security;
alter table public.regions enable row level security; alter table public.departements enable row level security; alter table public.communes enable row level security;
alter table public.profils enable row level security; alter table public.projets enable row level security; alter table public.inspections enable row level security;
alter table public.photos enable row level security; alter table public.alertes enable row level security; alter table public.historique enable row level security;

create policy "referentiels lisibles par utilisateurs" on public.ministeres for select to authenticated using (true);
create policy "secteurs lisibles par utilisateurs" on public.secteurs for select to authenticated using (true);
create policy "regions lisibles par utilisateurs" on public.regions for select to authenticated using (true);
create policy "departements lisibles par utilisateurs" on public.departements for select to authenticated using (true);
create policy "communes lisibles par utilisateurs" on public.communes for select to authenticated using (true);
create policy "profil personnel lisible" on public.profils for select to authenticated using ((select auth.uid())=id);
create policy "projets autorises lisibles" on public.projets for select to authenticated using (
 exists(select 1 from public.profils p where p.id=(select auth.uid()) and p.actif and (p.role in ('super_admin','directeur','analyste','lecture_seule') or p.ministere_id=projets.ministere_id))
);
create policy "inspections autorisees lisibles" on public.inspections for select to authenticated using (exists(select 1 from public.projets p where p.id=inspections.projet_id));
create policy "photos autorisees lisibles" on public.photos for select to authenticated using (exists(select 1 from public.projets p where p.id=photos.projet_id));
create policy "alertes autorisees lisibles" on public.alertes for select to authenticated using (exists(select 1 from public.projets p where p.id=alertes.projet_id));
create policy "audit lisible par super administrateur" on public.historique for select to authenticated using (
 exists(select 1 from public.profils p where p.id=(select auth.uid()) and p.actif and p.role='super_admin')
);
