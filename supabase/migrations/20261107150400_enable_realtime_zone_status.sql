-- Sans ça, la table n'émet aucun événement postgres_changes : l'abonnement
-- Realtime du front (useZoneStatus.subscribeRealtime) ne reçoit jamais rien,
-- et la carte ne se met à jour qu'au prochain fetch manuel (reload).
alter publication supabase_realtime add table public.zone_status;
