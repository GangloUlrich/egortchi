-- Durcissement recommandé par l'advisor Supabase : sans search_path fixe,
-- une fonction SECURITY DEFINER (ou appelée dans un contexte où le rôle
-- appelant contrôle search_path) peut être détournée vers des objets d'un
-- autre schéma portant le même nom. Aucun changement de comportement ici,
-- juste la fixation du schéma résolu.
alter function public.enforce_report_rate_limit() set search_path = public;
alter function public.enforce_report_location_bounds() set search_path = public;
alter function public.recompute_zone_status(text) set search_path = public;
alter function public.recompute_all_zone_statuses() set search_path = public;
alter function public.trigger_recompute_zone_status() set search_path = public;
alter function public.cleanup_old_reports() set search_path = public;
