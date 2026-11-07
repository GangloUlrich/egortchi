-- Rétention : un signalement ne sert au calcul de zone_status que pendant
-- 60 minutes (cf. recompute_zone_status) et courant ne garde pas d'historique
-- détaillé (hors scope MVP, cf. CLAUDE.md). On supprime donc chaque
-- signalement (et la position GPS qu'il contient) 24h après sa création.
create or replace function public.cleanup_old_reports()
returns void
language plpgsql
as $$
begin
  delete from public.reports where created_at < now() - interval '24 hours';
end;
$$;

-- Comme pour recompute_all_zone_statuses, le nettoyage tourne côté cron (pas
-- de déclencheur par signalement : on ne planifie pas un job par ligne
-- insérée), planifié via pg_cron dans 20261107150000_enable_pg_cron.sql.
