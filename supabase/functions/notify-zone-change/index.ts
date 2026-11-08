// Déclenchée par un Database Webhook Supabase sur `public.zone_status`
// (INSERT + UPDATE). Notifie les abonnés d'une zone uniquement quand son
// état confirmé change réellement (jamais à chaque signalement brut, jamais
// de notification globale), avec un cooldown de 15 min par zone/utilisateur.
//
// Secrets requis (supabase secrets set ...) :
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...)
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis automatiquement.

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:contact@courant.app'

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

const supabase = createClient(supabaseUrl, serviceRoleKey)

const NOTIFICATION_COOLDOWN_MINUTES = 15

type ZoneState = 'outage' | 'power' | 'unknown' | 'mixed'

interface ZoneStatusRow {
  zone_id: string
  status: ZoneState
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: ZoneStatusRow
  old_record: ZoneStatusRow | null
}

async function getZoneName(zoneId: string): Promise<string> {
  const { data } = await supabase.from('zones').select('name').eq('id', zoneId).maybeSingle()
  return data?.name ?? zoneId
}

function buildMessage(name: string, status: 'outage' | 'power' | 'mixed') {
  if (status === 'power') return { title: '⚡ Le courant est revenu', body: `Le courant est revenu à ${name}.` }
  if (status === 'outage') return { title: '🔌 Coupure signalée', body: `Une coupure est signalée à ${name}.` }
  return { title: '🔶 Coupure partielle', body: `${name} : coupure dans une partie du secteur, courant revenu ailleurs.` }
}

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as WebhookPayload

    if (payload.table !== 'zone_status') {
      return new Response('ignored', { status: 200 })
    }

    const { record, old_record } = payload
    const newStatus = record.status
    const previousStatus = old_record?.status

    // On ne notifie que sur un changement d'état confirmé (power <-> outage),
    // jamais sur un passage à "unknown", jamais à chaque signalement brut.
    if (newStatus === previousStatus || newStatus === 'unknown') {
      return new Response('no-op', { status: 200 })
    }

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('user_id, push_endpoint')
      .eq('zone_id', record.zone_id)

    if (error) throw error

    const cooldownCutoff = new Date(Date.now() - NOTIFICATION_COOLDOWN_MINUTES * 60_000).toISOString()
    const zoneName = await getZoneName(record.zone_id)
    const message = buildMessage(zoneName, newStatus)

    for (const sub of subscriptions ?? []) {
      const { data: recentLog } = await supabase
        .from('notification_log')
        .select('sent_at')
        .eq('user_id', sub.user_id)
        .eq('zone_id', record.zone_id)
        .gte('sent_at', cooldownCutoff)
        .limit(1)

      if (recentLog && recentLog.length > 0) continue // cooldown par zone/utilisateur

      try {
        await webpush.sendNotification(sub.push_endpoint, JSON.stringify(message))
        await supabase.from('notification_log').insert({ user_id: sub.user_id, zone_id: record.zone_id })
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          // Abonnement expiré côté navigateur : on arrête de réessayer.
          await supabase.from('subscriptions').delete().eq('user_id', sub.user_id).eq('zone_id', record.zone_id)
        } else {
          console.error('[notify-zone-change] push failed', err)
        }
      }
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('[notify-zone-change] error', err)
    return new Response('error', { status: 500 })
  }
})
