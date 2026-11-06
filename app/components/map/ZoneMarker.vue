<script setup lang="ts">
import { LCircle, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import type { Zone, ZoneStatusEntry } from '~/composables/useZoneStatus'

const props = defineProps<{
  zone: Zone
  status: ZoneStatusEntry
}>()

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
  if (props.status.status === 'power') return '#22c55e'
  if (props.status.status === 'outage') return '#ef4444'
  return '#94a3b8'
})

const statusLabel = computed(() => {
  if (props.status.status === 'power') return '⚡ Courant OK'
  if (props.status.status === 'outage') return '🔌 Coupure en cours'
  return 'État inconnu'
})

const sinceLabel = computed(() => {
  if (!props.status.updatedAt) return null
  const minutes = Math.max(0, Math.round((Date.now() - new Date(props.status.updatedAt).getTime()) / 60_000))
  if (minutes < 1) return "à l'instant"
  if (minutes === 1) return 'depuis 1 min'
  return `depuis ${minutes} min`
})
</script>

<template>
  <LCircle
    :lat-lng="[zone.lat, zone.lng]"
    :radius="zone.radius"
    :color="circleColor"
    :fill-color="circleColor"
    :fill-opacity="0.15"
    :weight="1"
  >
    <LPopup>
      <div class="min-w-[160px] text-sm">
        <p class="font-semibold text-slate-900">{{ zone.name }}</p>
        <p class="mt-1">{{ statusLabel }}</p>
        <p v-if="status.reportsCount > 0" class="text-slate-600">
          {{ status.reportsCount }} signalement{{ status.reportsCount > 1 ? 's' : '' }} récent{{ status.reportsCount > 1 ? 's' : '' }}
        </p>
        <p v-if="sinceLabel" class="text-slate-400">{{ sinceLabel }}</p>
      </div>
    </LPopup>
  </LCircle>
  <LMarker v-if="icon" :lat-lng="[zone.lat, zone.lng]" :icon="icon">
    <LPopup>
      <div class="min-w-[160px] text-sm">
        <p class="font-semibold text-slate-900">{{ zone.name }}</p>
        <p class="mt-1">{{ statusLabel }}</p>
        <p v-if="status.reportsCount > 0" class="text-slate-600">
          {{ status.reportsCount }} signalement{{ status.reportsCount > 1 ? 's' : '' }} récent{{ status.reportsCount > 1 ? 's' : '' }}
        </p>
        <p v-if="sinceLabel" class="text-slate-400">{{ sinceLabel }}</p>
      </div>
    </LPopup>
  </LMarker>
</template>
