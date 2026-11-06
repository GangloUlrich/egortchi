<script setup lang="ts">
import { LMap, LTileLayer } from '@vue-leaflet/vue-leaflet'
import ZoneMarker from './ZoneMarker.vue'

const { ZONES, statusByZone, isDemoMode, init, getStatus } = useZoneStatus()

onMounted(() => {
  init()
})

const lastUpdateLabel = computed(() => {
  const timestamps = ZONES.map((z) => statusByZone.value[z.id]?.updatedAt).filter(Boolean) as string[]
  if (timestamps.length === 0) return null
  const latest = timestamps.sort().at(-1)!
  return new Date(latest).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
})
</script>

<template>
  <div class="relative h-full w-full">
    <LMap
      :zoom="12"
      :center="[6.4, 2.36]"
      :min-zoom="11"
      :max-zoom="17"
      :use-global-leaflet="true"
      class="h-full w-full"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      <ZoneMarker
        v-for="zone in ZONES"
        :key="zone.id"
        :zone="zone"
        :status="getStatus(zone.id)"
      />
    </LMap>

    <div
      v-if="lastUpdateLabel"
      class="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow"
    >
      Dernière mise à jour : {{ lastUpdateLabel }}
      <span v-if="isDemoMode" class="text-slate-400">(démo)</span>
    </div>
  </div>
</template>
