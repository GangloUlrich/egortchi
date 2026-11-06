-- État agrégé de chaque zone, recalculé côté Postgres (jamais côté client).
-- Table (pas une vue) pour que Supabase Realtime puisse notifier le front
-- à chaque changement.
create table if not exists public.zone_status (
  zone_id text primary key references public.zones (id),
  status text not null default 'unknown' check (status in ('outage', 'power', 'unknown')),
  confidence real not null default 0,
  reports_count integer not null default 0,
  updated_at timestamptz
);

alter table public.zone_status enable row level security;

create policy "zone_status_public_read" on public.zone_status
  for select
  using (true);

insert into public.zone_status (zone_id)
select id from public.zones
on conflict (zone_id) do nothing;

-- Ne compte que les signalements des 60 dernières minutes, pondérés par
-- fraîcheur (poids 1 à l'instant du signalement, 0 à 60 minutes). Un état
-- n'est confirmé qu'à partir de 3 signalements concordants, ou d'une
-- majorité pondérée nette (>= 75%).
create or replace function public.recompute_zone_status(p_zone_id text)
returns void
language plpgsql
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

  insert into public.zone_status (zone_id, status, confidence, reports_count, updated_at)
  values (p_zone_id, v_status, v_confidence, v_total_count, v_latest)
  on conflict (zone_id) do update set
    status = excluded.status,
    confidence = excluded.confidence,
    reports_count = excluded.reports_count,
    updated_at = excluded.updated_at;
end;
$$;

create or replace function public.recompute_all_zone_statuses()
returns void
language plpgsql
as $$
declare
  z record;
begin
  for z in select id from public.zones loop
    perform public.recompute_zone_status(z.id);
  end loop;
end;
$$;

create or replace function public.trigger_recompute_zone_status()
returns trigger
language plpgsql
as $$
begin
  perform public.recompute_zone_status(new.zone_id);
  return new;
end;
$$;

create trigger reports_after_insert_recompute
  after insert on public.reports
  for each row
  execute function public.trigger_recompute_zone_status();

-- Sans nouveau signalement, une zone doit repasser en "inconnue" après
-- 60 minutes : le trigger ci-dessus ne suffit pas (rien ne le déclenche en
-- l'absence d'insert), il faut donc une réévaluation périodique. Active
-- l'extension pg_cron sur le projet Supabase (Database > Extensions) puis
-- décommente :
-- select cron.schedule('recompute-zone-status', '*/5 * * * *', $$select public.recompute_all_zone_statuses();$$);
