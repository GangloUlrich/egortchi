<script setup lang="ts">
import { LMap, LTileLayer } from '@vue-leaflet/vue-leaflet'
import { Search, X } from '@lucide/vue'
import ZoneMarker from './ZoneMarker.vue'
import { QUARTIERS } from '~/composables/useZoneStatus'

const { ZONES, statusByZone, isDemoMode, init, getStatus } = useZoneStatus()

const mapRef = ref<{ leafletObject?: { flyTo: (latlng: [number, number], zoom?: number) => void } } | null>(null)

onMounted(() => {
  init()
})

const lastUpdateLabel = computed(() => {
  const timestamps = ZONES.map((z) => statusByZone.value[z.id]?.updatedAt).filter(Boolean) as string[]
  if (timestamps.length === 0) return null
  const latest = timestamps.sort().at(-1)!
  return new Date(latest).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
})

const zonesById = computed(() => {
  const map = new Map(ZONES.map((z) => [z.id, z]))
  return map
})

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const quartierSearch = ref('')

const searchResults = computed(() => {
  const q = normalize(quartierSearch.value.trim())
  if (!q) return []
  return QUARTIERS.filter((quartier) => normalize(quartier.name).includes(q)).slice(0, 8)
})

function selectQuartier(secteurId: string) {
  const secteur = zonesById.value.get(secteurId)
  quartierSearch.value = ''
  if (!secteur) return
  mapRef.value?.leafletObject?.flyTo([secteur.lat, secteur.lng], 15)
}

function clearSearch() {
  quartierSearch.value = ''
}
</script>

<template>
  <div class="relative h-full w-full">
    <LMap
      ref="mapRef"
      :zoom="12"
      :center="[6.4, 2.36]"
      :min-zoom="10"
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

    <div class="pointer-events-none absolute inset-x-0 top-3 z-[1500] flex flex-col items-center gap-2 px-3">
      <div class="pointer-events-auto relative w-full max-w-sm">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="quartierSearch"
          type="text"
          inputmode="search"
          placeholder="Chercher un quartier sur la carte..."
          class="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-800 shadow focus:border-slate-400 focus:outline-none"
        />
        <button
          v-if="quartierSearch"
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          aria-label="Effacer la recherche"
          @click="clearSearch"
        >
          <X class="h-4 w-4" />
        </button>

        <div
          v-if="searchResults.length > 0"
          class="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto rounded-xl bg-white py-1 shadow-lg"
        >
          <button
            v-for="quartier in searchResults"
            :key="quartier.id"
            type="button"
            class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left active:bg-slate-100"
            @click="selectQuartier(quartier.secteurId)"
          >
            <span class="text-sm text-slate-800">{{ quartier.name }}</span>
            <span class="shrink-0 text-xs text-slate-400">{{ zonesById.get(quartier.secteurId)?.name }}</span>
          </button>
        </div>
      </div>

      <div
        v-if="lastUpdateLabel"
        class="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow"
      >
        Dernière mise à jour : {{ lastUpdateLabel }}
        <span v-if="isDemoMode" class="text-slate-400">(démo)</span>
      </div>
    </div>
  </div>
</template>
