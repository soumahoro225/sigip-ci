alter table public.projets add column if not exists localite text;
alter table public.projets add column if not exists latitude double precision;
alter table public.projets add column if not exists longitude double precision;
alter table public.projets add column if not exists is_demo boolean not null default false;
create index if not exists projets_demo_idx on public.projets(is_demo) where is_demo;

create or replace function private.calculer_risque_projet()
returns trigger language plpgsql set search_path='' as $$
declare v_score integer := 0; v_ecart numeric;
begin
  v_ecart := coalesce(new.avancement_financier,0)-coalesce(new.avancement_physique,0);
  if new.date_fin_prevue < current_date and new.date_fin_reelle is null and new.avancement_physique < 100 then v_score:=v_score+30; end if;
  if v_ecart >= 30 then v_score:=v_score+35; elsif v_ecart >= 15 then v_score:=v_score+20; end if;
  if new.avancement_financier >= 80 and new.avancement_physique < 50 then v_score:=v_score+25; end if;
  if new.montant_decaisse > new.budget_engage then v_score:=v_score+20; end if;
  if new.statut='en_retard' then v_score:=v_score+20; end if;
  new.score_risque:=least(v_score,100);
  new.niveau_risque:=case when v_score>=60 then 'critique'::public.niveau_risque when v_score>=30 then 'surveillance'::public.niveau_risque else 'normal'::public.niveau_risque end;
  return new;
end; $$;

drop trigger if exists projets_calcul_risque on public.projets;
create trigger projets_calcul_risque before insert or update of avancement_physique,avancement_financier,date_fin_prevue,date_fin_reelle,montant_decaisse,budget_engage,statut on public.projets for each row execute function private.calculer_risque_projet();

create policy "projets demo publics" on public.projets for select to anon using (is_demo);
create policy "ministeres publics pour demo" on public.ministeres for select to anon using (true);
create policy "secteurs publics pour demo" on public.secteurs for select to anon using (true);
create policy "regions publiques pour demo" on public.regions for select to anon using (true);
grant usage on schema public to anon;
grant select on public.projets,public.ministeres,public.secteurs,public.regions to anon;

insert into public.ministeres (nom,sigle) values
('Ministère de l’Équipement et de l’Entretien routier','MIN-01'),
('Ministère de la Santé, de l’Hygiène publique et de la CMU','MIN-02'),
('Ministère de l’Éducation nationale et de l’Alphabétisation','MIN-03'),
('Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','MIN-04'),
('Ministère des Mines, du Pétrole et de l’Énergie','MIN-05')
on conflict (nom) do nothing;

insert into public.secteurs (nom) values
('Routes'),
('Santé'),
('Éducation'),
('Eau'),
('Énergie'),
('Assainissement')
on conflict (nom) do nothing;

insert into public.regions (nom,code) values
('District d''Abidjan','TER-01'),
('District de Yamoussoukro','TER-02'),
('La Mé','TER-03'),
('Agnéby-Tiassa','TER-04'),
('Sud-Comoé','TER-05'),
('Moronou','TER-06'),
('N''Zi','TER-07'),
('Iffou','TER-08'),
('Gbêkê','TER-09'),
('Hambol','TER-10'),
('Poro','TER-11'),
('Bagoué','TER-12'),
('Tchologo','TER-13'),
('San-Pédro','TER-14'),
('Gbôklè','TER-15'),
('Nawa','TER-16'),
('Tonkpi','TER-17'),
('Guémon','TER-18'),
('Cavally','TER-19'),
('Haut-Sassandra','TER-20'),
('Marahoué','TER-21'),
('Gontougo','TER-22'),
('Bounkani','TER-23'),
('Kabadougou','TER-24'),
('Folon','TER-25'),
('Indénié-Djuablin','TER-26'),
('Gôh','TER-27'),
('Lôh-Djiboua','TER-28'),
('Worodougou','TER-29'),
('Béré','TER-30'),
('Bafing','TER-31'),
('Bélier','TER-32'),
('Grands-Ponts','TER-33')
on conflict (nom) do nothing;

with source(code_projet,nom,localite,ministere,secteur,region,cout_total,budget_engage,montant_decaisse,avancement_physique,avancement_financier,date_debut,date_fin_prevue,statut,latitude,longitude) as (values
('SIGIP-26-001','Réhabilitation de l’axe régional — Abidjan','Abidjan','Ministère de l’Équipement et de l’Entretien routier','Routes','District d''Abidjan',2800000000,2500000000,600000000,24,24,'2024-01-01','2025-01-28','en_retard',5.278,-4.117),
('SIGIP-26-002','Extension du centre hospitalier — Yamoussoukro','Yamoussoukro','Ministère de la Santé, de l’Hygiène publique et de la CMU','Santé','District de Yamoussoukro',6608000000,5900000000,3245000000,41,55,'2024-02-01','2027-02-28','en_cours',6.82,-5.3100000000000005),
('SIGIP-26-003','Programme hydraulique urbain — Adzopé','Adzopé','Ministère de l’Éducation nationale et de l’Alphabétisation','Éducation','La Mé',10416000000,9300000000,7998000000,58,86,'2024-03-01','2027-03-28','en_retard',6.180000000000001,-3.83),
('SIGIP-26-004','Construction de collèges de proximité — Agboville','Agboville','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Eau','Agnéby-Tiassa',14224000000,12700000000,12573000000,75,99,'2024-04-01','2027-04-28','en_cours',5.859999999999999,-4.13),
('SIGIP-26-005','Renforcement du réseau électrique — Aboisso','Aboisso','Ministère des Mines, du Pétrole et de l’Énergie','Énergie','Sud-Comoé',18032000000,16100000000,14812000000,92,92,'2024-05-01','2025-05-28','acheve',5.47,-3.29),
('SIGIP-26-006','Programme d’assainissement intégré — Bongouanou','Bongouanou','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Assainissement','Moronou',21840000000,19500000000,5265000000,13,27,'2024-06-01','2027-06-28','en_cours',6.720000000000001,-4.23),
('SIGIP-26-007','Réhabilitation de l’axe régional — Dimbokro','Dimbokro','Ministère de l’Équipement et de l’Entretien routier','Routes','N''Zi',25648000000,22900000000,13282000000,30,58,'2024-07-01','2027-07-28','en_retard',6.58,-4.68),
('SIGIP-26-008','Extension du centre hospitalier — Daoukro','Daoukro','Ministère de la Santé, de l’Hygiène publique et de la CMU','Santé','Iffou',29456000000,26300000000,23407000000,47,89,'2024-08-01','2027-08-28','en_retard',7.06,-3.87),
('SIGIP-26-009','Programme hydraulique urbain — Bouaké','Bouaké','Ministère de l’Éducation nationale et de l’Alphabétisation','Éducation','Gbêkê',33264000000,29700000000,19008000000,64,64,'2024-09-01','2025-09-28','en_cours',7.760000000000001,-5.12),
('SIGIP-26-010','Construction de collèges de proximité — Katiola','Katiola','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Eau','Hambol',37072000000,33100000000,31445000000,81,95,'2024-10-01','2027-10-28','en_cours',8.07,-5.13),
('SIGIP-26-011','Renforcement du réseau électrique — Korhogo','Korhogo','Ministère des Mines, du Pétrole et de l’Énergie','Énergie','Poro',40880000000,36500000000,10950000000,2,30,'2024-11-01','2027-11-28','en_retard',9.46,-5.6),
('SIGIP-26-012','Programme d’assainissement intégré — Boundiali','Boundiali','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Assainissement','Bagoué',44688000000,39900000000,24339000000,19,61,'2024-12-01','2027-12-28','en_retard',9.59,-6.4),
('SIGIP-26-013','Réhabilitation de l’axe régional — Ferkessédougou','Ferkessédougou','Ministère de l’Équipement et de l’Entretien routier','Routes','Tchologo',2800000000,2500000000,900000000,36,36,'2024-01-01','2025-01-28','en_cours',9.52,-5.29),
('SIGIP-26-014','Extension du centre hospitalier — San-Pédro','San-Pédro','Ministère de la Santé, de l’Hygiène publique et de la CMU','Santé','San-Pédro',6608000000,5900000000,3953000000,53,67,'2024-02-01','2027-02-28','en_cours',4.75,-6.67),
('SIGIP-26-015','Programme hydraulique urbain — Sassandra','Sassandra','Ministère de l’Éducation nationale et de l’Alphabétisation','Éducation','Gbôklè',10416000000,9300000000,9114000000,70,98,'2024-03-01','2027-03-28','en_retard',5.0200000000000005,-6.06),
('SIGIP-26-016','Construction de collèges de proximité — Soubré','Soubré','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Eau','Nawa',14224000000,12700000000,12573000000,87,99,'2024-04-01','2027-04-28','acheve',5.72,-6.5200000000000005),
('SIGIP-26-017','Renforcement du réseau électrique — Man','Man','Ministère des Mines, du Pétrole et de l’Énergie','Énergie','Tonkpi',18032000000,16100000000,1288000000,8,8,'2024-05-01','2025-05-28','en_cours',7.41,-7.64),
('SIGIP-26-018','Programme d’assainissement intégré — Duékoué','Duékoué','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Assainissement','Guémon',21840000000,19500000000,7605000000,25,39,'2024-06-01','2027-06-28','en_cours',6.8100000000000005,-7.38),
('SIGIP-26-019','Réhabilitation de l’axe régional — Guiglo','Guiglo','Ministère de l’Équipement et de l’Entretien routier','Routes','Cavally',25648000000,22900000000,16030000000,42,70,'2024-07-01','2027-07-28','en_retard',6.47,-7.46),
('SIGIP-26-020','Extension du centre hospitalier — Daloa','Daloa','Ministère de la Santé, de l’Hygiène publique et de la CMU','Santé','Haut-Sassandra',29456000000,26300000000,26037000000,59,99,'2024-08-01','2027-08-28','en_retard',6.88,-6.36),
('SIGIP-26-021','Programme hydraulique urbain — Bouaflé','Bouaflé','Ministère de l’Éducation nationale et de l’Alphabétisation','Éducation','Marahoué',33264000000,29700000000,22572000000,76,76,'2024-09-01','2025-09-28','en_cours',7.050000000000001,-5.84),
('SIGIP-26-022','Construction de collèges de proximité — Bondoukou','Bondoukou','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Eau','Gontougo',37072000000,33100000000,32769000000,93,99,'2024-10-01','2027-10-28','acheve',7.969999999999999,-2.8299999999999996),
('SIGIP-26-023','Renforcement du réseau électrique — Bouna','Bouna','Ministère des Mines, du Pétrole et de l’Énergie','Énergie','Bounkani',40880000000,36500000000,15330000000,14,42,'2024-11-01','2027-11-28','en_retard',9.27,-2.9600000000000004),
('SIGIP-26-024','Programme d’assainissement intégré — Odienné','Odienné','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Assainissement','Kabadougou',44688000000,39900000000,29127000000,31,73,'2024-12-01','2027-12-28','en_retard',9.58,-7.47),
('SIGIP-26-025','Réhabilitation de l’axe régional — Minignan','Minignan','Ministère de l’Équipement et de l’Entretien routier','Routes','Folon',2800000000,2500000000,1200000000,48,48,'2024-01-01','2025-01-28','en_cours',9.92,-7.93),
('SIGIP-26-026','Extension du centre hospitalier — Abengourou','Abengourou','Ministère de la Santé, de l’Hygiène publique et de la CMU','Santé','Indénié-Djuablin',6608000000,5900000000,4661000000,65,79,'2024-02-01','2027-02-28','en_cours',6.73,-3.53),
('SIGIP-26-027','Programme hydraulique urbain — Gagnoa','Gagnoa','Ministère de l’Éducation nationale et de l’Alphabétisation','Éducation','Gôh',10416000000,9300000000,9207000000,82,99,'2024-03-01','2027-03-28','en_cours',6.2,-5.92),
('SIGIP-26-028','Construction de collèges de proximité — Divo','Divo','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Eau','Lôh-Djiboua',14224000000,12700000000,5715000000,3,45,'2024-04-01','2027-04-28','en_retard',5.77,-5.2700000000000005),
('SIGIP-26-029','Renforcement du réseau électrique — Séguéla','Séguéla','Ministère des Mines, du Pétrole et de l’Énergie','Énergie','Worodougou',18032000000,16100000000,3220000000,20,20,'2024-05-01','2025-05-28','en_cours',7.96,-6.76),
('SIGIP-26-030','Programme d’assainissement intégré — Mankono','Mankono','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Assainissement','Béré',21840000000,19500000000,9945000000,37,51,'2024-06-01','2027-06-28','en_cours',8.13,-6.220000000000001),
('SIGIP-26-031','Réhabilitation de l’axe régional — Touba','Touba','Ministère de l’Équipement et de l’Entretien routier','Routes','Bafing',25648000000,22900000000,18778000000,54,82,'2024-07-01','2027-07-28','en_retard',8.209999999999999,-7.6499999999999995),
('SIGIP-26-032','Extension du centre hospitalier — Toumodi','Toumodi','Ministère de la Santé, de l’Hygiène publique et de la CMU','Santé','Bélier',29456000000,26300000000,26037000000,71,99,'2024-08-01','2027-08-28','en_retard',6.56,-4.93),
('SIGIP-26-033','Programme hydraulique urbain — Dabou','Dabou','Ministère de l’Éducation nationale et de l’Alphabétisation','Éducation','Grands-Ponts',33264000000,29700000000,26136000000,88,88,'2024-09-01','2025-09-28','acheve',5.4,-4.47),
('SIGIP-26-034','Construction de collèges de proximité — Abidjan','Abidjan','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Eau','District d''Abidjan',37072000000,33100000000,7613000000,9,23,'2024-10-01','2027-10-28','en_retard',5.278,-4.057),
('SIGIP-26-035','Renforcement du réseau électrique — Yamoussoukro','Yamoussoukro','Ministère des Mines, du Pétrole et de l’Énergie','Énergie','District de Yamoussoukro',40880000000,36500000000,19710000000,26,54,'2024-11-01','2027-11-28','en_retard',6.82,-5.25),
('SIGIP-26-036','Programme d’assainissement intégré — Adzopé','Adzopé','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Assainissement','La Mé',44688000000,39900000000,33915000000,43,85,'2024-12-01','2027-12-28','en_retard',6.180000000000001,-3.77),
('SIGIP-26-037','Réhabilitation de l’axe régional — Agboville','Agboville','Ministère de l’Équipement et de l’Entretien routier','Routes','Agnéby-Tiassa',2800000000,2500000000,1500000000,60,60,'2024-01-01','2025-01-28','en_cours',5.859999999999999,-4.31),
('SIGIP-26-038','Extension du centre hospitalier — Aboisso','Aboisso','Ministère de la Santé, de l’Hygiène publique et de la CMU','Santé','Sud-Comoé',6608000000,5900000000,5369000000,77,91,'2024-02-01','2027-02-28','en_cours',5.47,-3.23),
('SIGIP-26-039','Programme hydraulique urbain — Bongouanou','Bongouanou','Ministère de l’Éducation nationale et de l’Alphabétisation','Éducation','Moronou',10416000000,9300000000,9207000000,94,99,'2024-03-01','2027-03-28','acheve',6.720000000000001,-4.17),
('SIGIP-26-040','Construction de collèges de proximité — Dimbokro','Dimbokro','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Eau','N''Zi',14224000000,12700000000,7239000000,15,57,'2024-04-01','2027-04-28','en_retard',6.58,-4.62),
('SIGIP-26-041','Renforcement du réseau électrique — Daoukro','Daoukro','Ministère des Mines, du Pétrole et de l’Énergie','Énergie','Iffou',18032000000,16100000000,5152000000,32,32,'2024-05-01','2025-05-28','en_cours',7.06,-4.05),
('SIGIP-26-042','Programme d’assainissement intégré — Bouaké','Bouaké','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Assainissement','Gbêkê',21840000000,19500000000,12285000000,49,63,'2024-06-01','2027-06-28','en_cours',7.760000000000001,-5.0600000000000005),
('SIGIP-26-043','Réhabilitation de l’axe régional — Katiola','Katiola','Ministère de l’Équipement et de l’Entretien routier','Routes','Hambol',25648000000,22900000000,21526000000,66,94,'2024-07-01','2027-07-28','en_retard',8.07,-5.069999999999999),
('SIGIP-26-044','Extension du centre hospitalier — Korhogo','Korhogo','Ministère de la Santé, de l’Hygiène publique et de la CMU','Santé','Poro',29456000000,26300000000,26037000000,83,99,'2024-08-01','2027-08-28','en_cours',9.46,-5.54),
('SIGIP-26-045','Programme hydraulique urbain — Boundiali','Boundiali','Ministère de l’Éducation nationale et de l’Alphabétisation','Éducation','Bagoué',33264000000,29700000000,1188000000,4,4,'2024-09-01','2025-09-28','en_cours',9.59,-6.58),
('SIGIP-26-046','Construction de collèges de proximité — Ferkessédougou','Ferkessédougou','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Eau','Tchologo',37072000000,33100000000,11585000000,21,35,'2024-10-01','2027-10-28','en_retard',9.52,-5.23),
('SIGIP-26-047','Renforcement du réseau électrique — San-Pédro','San-Pédro','Ministère des Mines, du Pétrole et de l’Énergie','Énergie','San-Pédro',40880000000,36500000000,24090000000,38,66,'2024-11-01','2027-11-28','en_retard',4.75,-6.609999999999999),
('SIGIP-26-048','Programme d’assainissement intégré — Sassandra','Sassandra','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Assainissement','Gbôklè',44688000000,39900000000,38703000000,55,97,'2024-12-01','2027-12-28','en_retard',5.0200000000000005,-6),
('SIGIP-26-049','Réhabilitation de l’axe régional — Soubré','Soubré','Ministère de l’Équipement et de l’Entretien routier','Routes','Nawa',2800000000,2500000000,1800000000,72,72,'2024-01-01','2025-01-28','en_cours',5.72,-6.7),
('SIGIP-26-050','Extension du centre hospitalier — Man','Man','Ministère de la Santé, de l’Hygiène publique et de la CMU','Santé','Tonkpi',6608000000,5900000000,5841000000,89,99,'2024-02-01','2027-02-28','acheve',7.41,-7.58),
('SIGIP-26-051','Programme hydraulique urbain — Duékoué','Duékoué','Ministère de l’Éducation nationale et de l’Alphabétisation','Éducation','Guémon',10416000000,9300000000,3534000000,10,38,'2024-03-01','2027-03-28','en_retard',6.8100000000000005,-7.319999999999999),
('SIGIP-26-052','Construction de collèges de proximité — Guiglo','Guiglo','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Eau','Cavally',14224000000,12700000000,8763000000,27,69,'2024-04-01','2027-04-28','en_retard',6.47,-7.4),
('SIGIP-26-053','Renforcement du réseau électrique — Daloa','Daloa','Ministère des Mines, du Pétrole et de l’Énergie','Énergie','Haut-Sassandra',18032000000,16100000000,7084000000,44,44,'2024-05-01','2025-05-28','en_cours',6.88,-6.54),
('SIGIP-26-054','Programme d’assainissement intégré — Bouaflé','Bouaflé','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Assainissement','Marahoué',21840000000,19500000000,14625000000,61,75,'2024-06-01','2027-06-28','en_cours',7.050000000000001,-5.78),
('SIGIP-26-055','Réhabilitation de l’axe régional — Bondoukou','Bondoukou','Ministère de l’Équipement et de l’Entretien routier','Routes','Gontougo',25648000000,22900000000,22671000000,78,99,'2024-07-01','2027-07-28','en_cours',7.969999999999999,-2.77),
('SIGIP-26-056','Extension du centre hospitalier — Bouna','Bouna','Ministère de la Santé, de l’Hygiène publique et de la CMU','Santé','Bounkani',29456000000,26300000000,26037000000,95,99,'2024-08-01','2027-08-28','acheve',9.27,-2.9000000000000004),
('SIGIP-26-057','Programme hydraulique urbain — Odienné','Odienné','Ministère de l’Éducation nationale et de l’Alphabétisation','Éducation','Kabadougou',33264000000,29700000000,4752000000,16,16,'2024-09-01','2025-09-28','en_cours',9.58,-7.6499999999999995),
('SIGIP-26-058','Construction de collèges de proximité — Minignan','Minignan','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Eau','Folon',37072000000,33100000000,15557000000,33,47,'2024-10-01','2027-10-28','en_retard',9.92,-7.87),
('SIGIP-26-059','Renforcement du réseau électrique — Abengourou','Abengourou','Ministère des Mines, du Pétrole et de l’Énergie','Énergie','Indénié-Djuablin',40880000000,36500000000,28470000000,50,78,'2024-11-01','2027-11-28','en_retard',6.73,-3.47),
('SIGIP-26-060','Programme d’assainissement intégré — Gagnoa','Gagnoa','Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité','Assainissement','Gôh',44688000000,39900000000,39501000000,67,99,'2024-12-01','2027-12-28','en_retard',6.2,-5.86)
)
insert into public.projets (code_projet,nom,localite,ministere_id,secteur_id,region_id,cout_total,budget_engage,montant_decaisse,avancement_physique,avancement_financier,date_debut,date_fin_prevue,statut,latitude,longitude,geom,is_demo)
select s.code_projet,s.nom,s.localite,m.id,se.id,r.id,s.cout_total,s.budget_engage,s.montant_decaisse,s.avancement_physique,s.avancement_financier,s.date_debut::date,s.date_fin_prevue::date,s.statut,s.latitude,s.longitude,extensions.st_setsrid(extensions.st_makepoint(s.longitude,s.latitude),4326),true
from source s join public.ministeres m on m.nom=s.ministere join public.secteurs se on se.nom=s.secteur join public.regions r on r.nom=s.region
on conflict (code_projet) do update set nom=excluded.nom,localite=excluded.localite,ministere_id=excluded.ministere_id,secteur_id=excluded.secteur_id,region_id=excluded.region_id,cout_total=excluded.cout_total,budget_engage=excluded.budget_engage,montant_decaisse=excluded.montant_decaisse,avancement_physique=excluded.avancement_physique,avancement_financier=excluded.avancement_financier,date_debut=excluded.date_debut,date_fin_prevue=excluded.date_fin_prevue,statut=excluded.statut,latitude=excluded.latitude,longitude=excluded.longitude,geom=excluded.geom,is_demo=true;

