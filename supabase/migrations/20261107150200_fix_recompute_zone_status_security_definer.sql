-- recompute_zone_status() est appelée par un trigger AFTER INSERT sur
-- `reports`, donc exécutée avec les droits de l'utilisateur qui signale
-- (authenticated/anon). Or `zone_status` n'a qu'une policy de lecture
-- publique (écriture réservée au calcul interne) : sans SECURITY DEFINER,
-- l'upsert dans zone_status échoue avec "new row violates row-level
-- security policy for table zone_status" et bloque le signalement.
-- Le search_path est déjà fixé (migration précédente), condition de
-- sécurité nécessaire pour une fonction SECURITY DEFINER.
alter function public.recompute_zone_status(text) security definer;
alter function public.recompute_all_zone_statuses() security definer;
