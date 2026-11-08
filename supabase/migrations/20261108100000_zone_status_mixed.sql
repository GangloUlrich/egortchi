-- Un secteur peut avoir SIMULTANÉMENT des quartiers confirmés en coupure et
-- des quartiers confirmés avec le courant (ex. coupure à Tanto, courant
-- revenu à Suru Lere, même secteur). On introduit l'état 'mixed' (cercle
-- orange sur la carte) et on remplace la liste unique `quartier_ids` par
-- deux listes, une par statut.
alter table public.zone_status drop constraint if exists zone_status_status_check;
alter table public.zone_status add constraint zone_status_status_check
  check (status in ('outage', 'power', 'unknown', 'mixed'));

alter table public.zone_status add column if not exists outage_quartier_ids text[] not null default '{}';
alter table public.zone_status add column if not exists power_quartier_ids text[] not null default '{}';
alter table public.zone_status drop column if exists quartier_ids;

create or replace function public.recompute_zone_status(p_zone_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_power_weight double precision := 0;
  v_outage_weight double precision := 0;
  v_power_count integer := 0;
  v_outage_count integer := 0;
  v_total_count integer := 0;
  v_latest timestamptz;
  v_status text := 'unknown';
  v_power_share double precision := 0;
  v_outage_share double precision := 0;
  v_power_confirmed boolean;
  v_outage_confirmed boolean;
  v_outage_quartier_ids text[] := '{}';
  v_power_quartier_ids text[] := '{}';
begin
  select
    coalesce(sum(case when status = 'power' then freshness else 0 end), 0),
    coalesce(sum(case when status = 'outage' then freshness else 0 end), 0),
    coalesce(count(*) filter (where status = 'power'), 0),
    coalesce(count(*) filter (where status = 'outage'), 0),
    coalesce(count(*), 0),
    max(created_at)
  into v_power_weight, v_outage_weight, v_power_count, v_outage_count, v_total_count, v_latest
  from (
    select
      status,
      created_at,
      greatest(0, 1 - extract(epoch from (now() - created_at)) / 3600.0) as freshness
    from public.reports
    where zone_id = p_zone_id
      and created_at >= now() - interval '60 minutes'
  ) recent;

  if (v_power_weight + v_outage_weight) > 0 then
    v_power_share := v_power_weight / (v_power_weight + v_outage_weight);
    v_outage_share := v_outage_weight / (v_power_weight + v_outage_weight);
  end if;

  -- Les deux statuts sont confirmés indépendamment (et non l'un contre
  -- l'autre) : un secteur peut confirmer les deux à la fois ('mixed').
  v_power_confirmed := v_power_count >= 3 or v_power_share >= 0.75;
  v_outage_confirmed := v_outage_count >= 3 or v_outage_share >= 0.75;

  if v_power_confirmed and v_outage_confirmed then
    v_status := 'mixed';
  elsif v_outage_confirmed then
    v_status := 'outage';
  elsif v_power_confirmed then
    v_status := 'power';
  end if;

  if v_outage_confirmed then
    select coalesce(array_agg(distinct quartier_id order by quartier_id), '{}')
    into v_outage_quartier_ids
    from public.reports
    where zone_id = p_zone_id and status = 'outage' and quartier_id is not null
      and created_at >= now() - interval '60 minutes';
  end if;

  if v_power_confirmed then
    select coalesce(array_agg(distinct quartier_id order by quartier_id), '{}')
    into v_power_quartier_ids
    from public.reports
    where zone_id = p_zone_id and status = 'power' and quartier_id is not null
      and created_at >= now() - interval '60 minutes';
  end if;

  insert into public.zone_status (zone_id, status, confidence, reports_count, updated_at, outage_quartier_ids, power_quartier_ids)
  values (p_zone_id, v_status, greatest(v_power_share, v_outage_share), v_total_count, v_latest, v_outage_quartier_ids, v_power_quartier_ids)
  on conflict (zone_id) do update set
    status = excluded.status,
    confidence = excluded.confidence,
    reports_count = excluded.reports_count,
    updated_at = excluded.updated_at,
    outage_quartier_ids = excluded.outage_quartier_ids,
    power_quartier_ids = excluded.power_quartier_ids;
end;
$$;

-- Backfill immédiat pour les secteurs déjà en état confirmé.
select public.recompute_all_zone_statuses();
