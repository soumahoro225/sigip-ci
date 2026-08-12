create index inspections_inspecteur_idx on public.inspections(inspecteur_id);
create index photos_projet_idx on public.photos(projet_id);
create index photos_inspection_idx on public.photos(inspection_id);
create index profils_ministere_idx on public.profils(ministere_id);
create index projets_secteur_idx on public.projets(secteur_id);
create index projets_departement_idx on public.projets(departement_id);
create index projets_commune_idx on public.projets(commune_id);
create index historique_projet_idx on public.historique(projet_id);
create index historique_utilisateur_idx on public.historique(utilisateur_id);
create policy "audit lisible par super administrateur" on public.historique for select to authenticated using (
 exists(select 1 from public.profils p where p.id=(select auth.uid()) and p.actif and p.role='super_admin')
);
