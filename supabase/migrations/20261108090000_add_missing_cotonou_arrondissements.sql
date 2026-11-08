-- Les 1er, 2e, 3e, 5e et 6e arrondissements de Cotonou manquaient de la table
-- `zones` (seuls 4e et 7e-13e y figuraient). Liste officielle des quartiers
-- fournie par l'utilisateur (répertoire communal) : ces 5 arrondissements
-- existent bel et bien et doivent pouvoir recevoir des signalements.
-- Centroïdes géocodés via OpenStreetMap/Nominatim, cf. app/composables/useZoneStatus.ts.
insert into public.zones (id, name, geom, radius_m) values
  ('1er-arrondissement', '1er Arrondissement', geography(st_makepoint(2.4776425, 6.3679365)), 1300),
  ('2e-arrondissement', '2e Arrondissement', geography(st_makepoint(2.4668064, 6.3837586)), 1300),
  ('3e-arrondissement', '3e Arrondissement', geography(st_makepoint(2.4440437, 6.381515)), 1300),
  ('5e-arrondissement', '5e Arrondissement', geography(st_makepoint(2.4303984, 6.3539705)), 1300),
  ('6e-arrondissement', '6e Arrondissement', geography(st_makepoint(2.4238074, 6.3809254)), 1300)
on conflict (id) do nothing;

-- zone_status doit avoir une ligne pour chaque zone (cf. 20261106120300_zone_status.sql).
insert into public.zone_status (zone_id)
select id from public.zones
on conflict (zone_id) do nothing;

-- Le 1er Arrondissement dépasse légèrement l'ancienne bbox anti-abus
-- (maxLng 2.47) : on l'étend pour le couvrir, en miroir de
-- SERVICE_BBOX dans app/composables/useZoneStatus.ts.
create or replace function public.enforce_report_location_bounds()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.accuracy is not null and new.accuracy > 1000 then
    raise exception 'low_accuracy: précision GPS insuffisante';
  end if;

  if not st_within(
    new.location::geometry,
    st_makeenvelope(2.24, 6.3, 2.5, 6.7, 4326)
  ) then
    raise exception 'out_of_area: position hors de la zone couverte (Cotonou / Abomey-Calavi)';
  end if;

  return new;
end;
$$;
