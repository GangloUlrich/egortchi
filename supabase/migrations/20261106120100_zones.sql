-- Zones (quartiers) de l'axe Cotonou <-> Abomey-Calavi. MVP : polygones de
-- quartiers représentés par un centroïde + rayon plutôt qu'une grille H3.
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
  ('cotonou-centre', 'Cotonou Centre', geography(st_makepoint(2.3912, 6.3703)), 900),
  ('fidjrosse', 'Fidjrossè', geography(st_makepoint(2.3745, 6.3528)), 900),
  ('akpakpa', 'Akpakpa', geography(st_makepoint(2.445, 6.365)), 1100),
  ('cadjehoun', 'Cadjèhoun', geography(st_makepoint(2.387, 6.358)), 800),
  ('gbegamey', 'Gbégamey', geography(st_makepoint(2.395, 6.38)), 800),
  ('agla', 'Agla', geography(st_makepoint(2.37, 6.385)), 900),
  ('godomey', 'Godomey', geography(st_makepoint(2.335, 6.385)), 1100),
  ('togba', 'Togba', geography(st_makepoint(2.33, 6.405)), 1100),
  ('cococodji', 'Cococodji', geography(st_makepoint(2.34, 6.4)), 1000),
  ('abomey-calavi-centre', 'Abomey-Calavi Centre', geography(st_makepoint(2.3554, 6.4486)), 1100),
  ('akassato', 'Akassato', geography(st_makepoint(2.335, 6.47)), 1100),
  ('hevie', 'Hévié', geography(st_makepoint(2.295, 6.43)), 1200)
on conflict (id) do nothing;
