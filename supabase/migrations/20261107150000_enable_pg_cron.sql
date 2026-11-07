-- Active les réévaluations périodiques nécessaires en l'absence de nouveau
-- signalement : une zone sans signalement depuis 60 min doit repasser en
-- "inconnue" (cf. zone_status.sql), et les signalements de plus de 24h
-- doivent être purgés (cf. reports_retention.sql).
create extension if not exists pg_cron;

select cron.schedule('recompute-zone-status', '*/5 * * * *', $$select public.recompute_all_zone_statuses();$$);
select cron.schedule('cleanup-old-reports', '0 * * * *', $$select public.cleanup_old_reports();$$);
