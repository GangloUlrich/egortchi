-- Abonnements push : l'utilisateur choisit explicitement ses zones (maison,
-- bureau, campus...). Jamais de notification globale.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  zone_id text not null references public.zones (id),
  push_endpoint jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, zone_id, push_endpoint)
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions
  for select
  using (auth.uid() = user_id);

create policy "subscriptions_insert_own" on public.subscriptions
  for insert
  with check (auth.uid() = user_id);

create policy "subscriptions_delete_own" on public.subscriptions
  for delete
  using (auth.uid() = user_id);

-- Historique des notifications envoyées, pour le cooldown de 15 min par
-- zone et par utilisateur (appliqué par l'Edge Function notify-zone-change).
create table if not exists public.notification_log (
  user_id uuid not null references auth.users (id) on delete cascade,
  zone_id text not null references public.zones (id),
  sent_at timestamptz not null default now(),
  primary key (user_id, zone_id, sent_at)
);

alter table public.notification_log enable row level security;

create policy "notification_log_select_own" on public.notification_log
  for select
  using (auth.uid() = user_id);
