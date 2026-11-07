-- Signalements bruts des utilisateurs ("Coupure" / "Le courant est là").
-- `zone_id` rattache toujours le signalement à son secteur/arrondissement
-- (c'est ce qui est affiché sur la carte). `quartier_id` précise, quand il
-- est connu (sélection manuelle dans la liste), le quartier exact signalé ;
-- il reste nul pour un signalement géolocalisé (on ne sait identifier que le
-- secteur le plus proche, pas le quartier).
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  zone_id text not null references public.zones (id),
  quartier_id text,
  status text not null check (status in ('outage', 'power')),
  location geography(point, 4326) not null,
  accuracy real,
  created_at timestamptz not null default now()
);

create index if not exists reports_zone_created_idx on public.reports (zone_id, created_at desc);
create index if not exists reports_user_quartier_status_idx
  on public.reports (user_id, status, (coalesce(quartier_id, zone_id)), created_at desc);

alter table public.reports enable row level security;

-- L'état public d'une zone passe par zone_status ; un utilisateur ne lit
-- que ses propres signalements.
create policy "reports_select_own" on public.reports
  for select
  using (auth.uid() = user_id);

create policy "reports_insert_own" on public.reports
  for insert
  with check (auth.uid() = user_id);

-- Anti-abus : un signalement par utilisateur, par quartier (ou secteur à
-- défaut de quartier connu) ET par statut, toutes les 10 minutes. Les deux
-- statuts ont des cooldowns indépendants : signaler une coupure n'empêche
-- pas de signaler le retour du courant juste après, dans le même quartier.
create or replace function public.enforce_report_rate_limit()
returns trigger
language plpgsql
as $$
declare
  last_report_at timestamptz;
begin
  select created_at into last_report_at
  from public.reports
  where user_id = new.user_id
    and status = new.status
    and coalesce(quartier_id, zone_id) = coalesce(new.quartier_id, new.zone_id)
  order by created_at desc
  limit 1;

  if last_report_at is not null and new.created_at - last_report_at < interval '10 minutes' then
    raise exception 'rate_limited: un signalement par quartier et par statut toutes les 10 minutes';
  end if;

  return new;
end;
$$;

create trigger reports_rate_limit
  before insert on public.reports
  for each row
  execute function public.enforce_report_rate_limit();

-- Anti-abus : précision GPS trop faible, ou position hors de la bbox
-- Cotonou / Abomey-Calavi (pour le MVP).
create or replace function public.enforce_report_location_bounds()
returns trigger
language plpgsql
as $$
begin
  if new.accuracy is not null and new.accuracy > 1000 then
    raise exception 'low_accuracy: précision GPS insuffisante';
  end if;

  if not st_within(
    new.location::geometry,
    st_makeenvelope(2.24, 6.3, 2.47, 6.7, 4326)
  ) then
    raise exception 'out_of_area: position hors de la zone couverte (Cotonou / Abomey-Calavi)';
  end if;

  return new;
end;
$$;

create trigger reports_location_bounds
  before insert on public.reports
  for each row
  execute function public.enforce_report_location_bounds();
