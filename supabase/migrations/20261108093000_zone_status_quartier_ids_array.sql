-- `last_quartier_id` ne gardait que le DERNIER quartier signalé. Si deux
-- quartiers distincts d'un même secteur sont tous les deux en coupure
-- (ex. Tanto et Suru Lere dans le 1er Arrondissement), le popup carte ne
-- montrait que l'un des deux. On passe à un tableau de tous les quartiers
-- distincts à l'origine de l'état confirmé.
alter table public.zone_status add column if not exists quartier_ids text[] not null default '{}';
alter table public.zone_status drop column if exists last_quartier_id;

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
  v_confidence real := 0;
  v_share double precision;
  v_quartier_ids text[] := '{}';
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

  if v_total_count > 0 then
    if v_power_weight >= v_outage_weight then
      v_share := case when (v_power_weight + v_outage_weight) > 0
        then v_power_weight / (v_power_weight + v_outage_weight) else 0 end;
      if v_power_count >= 3 or v_share >= 0.75 then
        v_status := 'power';
        v_confidence := v_share;
      end if;
    else
      v_share := case when (v_power_weight + v_outage_weight) > 0
        then v_outage_weight / (v_power_weight + v_outage_weight) else 0 end;
      if v_outage_count >= 3 or v_share >= 0.75 then
        v_status := 'outage';
        v_confidence := v_share;
      end if;
    end if;
  end if;

  if v_status != 'unknown' then
    select coalesce(array_agg(distinct quartier_id order by quartier_id), '{}')
    into v_quartier_ids
    from public.reports
    where zone_id = p_zone_id
      and status = v_status
      and quartier_id is not null
      and created_at >= now() - interval '60 minutes';
  end if;

  insert into public.zone_status (zone_id, status, confidence, reports_count, updated_at, quartier_ids)
  values (p_zone_id, v_status, v_confidence, v_total_count, v_latest, v_quartier_ids)
  on conflict (zone_id) do update set
    status = excluded.status,
    confidence = excluded.confidence,
    reports_count = excluded.reports_count,
    updated_at = excluded.updated_at,
    quartier_ids = excluded.quartier_ids;
end;
$$;

-- Backfill immédiat pour les secteurs déjà en état confirmé.
select public.recompute_all_zone_statuses();
