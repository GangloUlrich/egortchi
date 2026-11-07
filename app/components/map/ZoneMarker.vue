<script setup lang="ts">
import { LCircle, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import type { Zone, ZoneStatusEntry } from '~/composables/useZoneStatus'
import { QUARTIERS } from '~/composables/useZoneStatus'

const props = defineProps<{
  zone: Zone
  status: ZoneStatusEntry
}>()

const { submitting, reportToZone } = useReports()
const { show } = useToast()

const icon = computed(() => {
  if (props.status.status === 'unknown') return undefined
  const emoji = props.status.status === 'power' ? '⚡' : '🔌'
  const toneClass = props.status.status === 'power' ? 'zone-icon--power' : 'zone-icon--outage'
  return L.divIcon({
    html: `<div class="zone-icon ${toneClass}">${emoji}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  }) as unknown as L.Icon
})

const circleColor = computed(() => {
  return props.status.status === 'power' ? '#16a34a' : '#dc2626'
})

const statusLabel = computed(() => {
  if (props.status.status === 'power') return '⚡ Courant OK'
  if (props.status.status === 'outage') return '🔌 Coupure en cours'
  return 'État inconnu'
})

/** Nom du quartier précis à l'origine de l'état affiché, si connu (signalement manuel, pas géolocalisé). */
const quartierName = computed(() => {
  if (!props.status.lastQuartierId) return null
  return QUARTIERS.find((q) => q.id === props.status.lastQuartierId)?.name ?? null
})

const sinceLabel = computed(() => {
  if (!props.status.updatedAt) return null
  const minutes = Math.max(0, Math.round((Date.now() - new Date(props.status.updatedAt).getTime()) / 60_000))
  if (minutes < 1) return "à l'instant"
  if (minutes === 1) return 'depuis 1 min'
  return `depuis ${minutes} min`
})

async function reportPowerBack() {
  if (submitting.value) return
  const result = await reportToZone(props.zone, 'power', props.status.lastQuartierId)
  if (result.ok) {
    if ('vibrate' in navigator) navigator.vibrate(60)
    show(`⚡ Retour du courant signalé${quartierName.value ? ' à ' + quartierName.value : ''}`, 'success')
  } else if (result.reason === 'cooldown') {
    show('Déjà signalé récemment. Réessaie plus tard.', 'info')
  } else {
    show('Une erreur est survenue. Réessaie.', 'error')
  }
}
</script>

<template>
  <LCircle
    v-if="status.status !== 'unknown'"
    :lat-lng="[zone.lat, zone.lng]"
    :radius="zone.radius"
    :color="circleColor"
    :fill-color="circleColor"
    :fill-opacity="0.15"
    :weight="1"
  />
  <LMarker v-if="icon" :lat-lng="[zone.lat, zone.lng]" :icon="icon">
    <LPopup>
      <div class="min-w-[170px] text-sm">
        <p class="font-semibold text-slate-900">{{ zone.name }}</p>
        <p v-if="quartierName" class="text-slate-700">{{ quartierName }}</p>
        <p class="mt-1">{{ statusLabel }}</p>
        <p v-if="status.reportsCount > 0" class="text-slate-600">
          {{ status.reportsCount }} signalement{{ status.reportsCount > 1 ? 's' : '' }} récent{{ status.reportsCount > 1 ? 's' : '' }}
        </p>
        <p v-if="sinceLabel" class="text-slate-400">{{ sinceLabel }}</p>
        <button
          v-if="status.status === 'outage'"
          type="button"
          :disabled="submitting"
          class="mt-2 w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white active:bg-green-700 disabled:opacity-60"
          @click="reportPowerBack"
        >
          ⚡ Signaler le retour du courant
        </button>
      </div>
    </LPopup>
  </LMarker>
</template>
