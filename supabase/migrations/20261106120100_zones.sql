-- Zones (secteurs) de signalement : arrondissements officiels de Cotonou
-- et sections communales d'Abomey-Calavi, représentés par un centroïde
-- géocodé + rayon plutôt qu'une grille H3. Les quartiers individuels de
-- chaque secteur sont gérés côté front (filtre/sélecteur uniquement,
-- cf. QUARTIERS dans app/composables/useZoneStatus.ts).
create table if not exists public.zones (
  id text primary key,
  name text not null,
  geom geography(point, 4326) not null,
  radius_m integer not null default 1000,
  created_at timestamptz not null default now()
);

alter table public.zones enable row level security;

create policy "zones_public_read" on public.zones
  for select
  using (true);

insert into public.zones (id, name, geom, radius_m) values
  ('4e-arrondissement', '4e Arrondissement', geography(st_makepoint(2.4512569, 6.3629545)), 1300),
  ('7e-arrondissement', '7e Arrondissement', geography(st_makepoint(2.4193839, 6.3701637)), 1300),
  ('8e-arrondissement', '8e Arrondissement', geography(st_makepoint(2.4079647, 6.3781607)), 1300),
  ('9e-arrondissement', '9e Arrondissement', geography(st_makepoint(2.3859534, 6.3912755)), 1300),
  ('10e-arrondissement', '10e Arrondissement', geography(st_makepoint(2.3924921, 6.3840079)), 1300),
  ('11e-arrondissement', '11e Arrondissement', geography(st_makepoint(2.4095618, 6.3671755)), 1300),
  ('12e-arrondissement', '12e Arrondissement', geography(st_makepoint(2.3994, 6.3614375)), 1300),
  ('13e-arrondissement', '13e Arrondissement', geography(st_makepoint(2.3692293, 6.375472)), 1300),
  ('abomey-calavi-centre', 'Abomey-Calavi Centre', geography(st_makepoint(2.354245, 6.4538637)), 1600),
  ('godomey', 'Godomey', geography(st_makepoint(2.3432407, 6.3854438)), 1600),
  ('akassato', 'Akassato', geography(st_makepoint(2.365643, 6.5073708)), 1600),
  ('glo-djigbe', 'Glo-Djigbé', geography(st_makepoint(2.3032531, 6.5592571)), 1800),
  ('hevie', 'Hévié', geography(st_makepoint(2.2571111, 6.4138647)), 1600),
  ('kpanroun', 'Kpanroun', geography(st_makepoint(2.3667316, 6.6739449)), 1800),
  ('ouedo', 'Ouèdo', geography(st_makepoint(2.2670915, 6.4524367)), 1600),
  ('togba', 'Togba', geography(st_makepoint(2.3048643, 6.4651364)), 1600),
  ('zinvie', 'Zinvié', geography(st_makepoint(2.3567957, 6.6133818)), 1800)
on conflict (id) do nothing;
