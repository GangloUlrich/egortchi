-- Appelle l'Edge Function notify-zone-change à chaque changement de
-- zone_status, via pg_net (même mécanisme que les "Database Webhooks" du
-- Dashboard, reproduit ici en SQL car le schéma supabase_functions n'est
-- pas provisionné sur ce projet). verify_jwt = false sur la fonction, donc
-- aucun header d'auth n'est nécessaire.
create extension if not exists pg_net;

create or replace function public.notify_zone_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://ymhemjsufcwzglvgzjag.supabase.co/functions/v1/notify-zone-change',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'type', tg_op,
      'table', tg_table_name,
      'record', to_jsonb(new),
      'old_record', case when tg_op = 'UPDATE' then to_jsonb(old) else null end
    )
  );
  return new;
end;
$$;

create trigger zone_status_notify_webhook
  after insert or update on public.zone_status
  for each row
  execute function public.notify_zone_status_change();
