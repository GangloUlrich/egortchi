<script setup lang="ts">
import { ArrowLeft, Bell, BellOff, Search } from '@lucide/vue'
import { ZONES, QUARTIERS } from '~/composables/useZoneStatus'

const { permission, isSubscribed, subscribeToZone, unsubscribeFromZone, requestPermissionAndSubscribe } =
  usePushSubscription()
const { show } = useToast()

const search = ref('')

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const filteredZones = computed(() => {
  const q = normalize(search.value.trim())
  if (!q) return ZONES
  return ZONES.filter((zone) => {
    if (normalize(zone.name).includes(q)) return true
    return QUARTIERS.some((quartier) => quartier.secteurId === zone.id && normalize(quartier.name).includes(q))
  })
})

async function toggleZone(zoneId: string, zoneName: string) {
  if (isSubscribed(zoneId)) {
    unsubscribeFromZone(zoneId)
    show(`Notifications désactivées pour ${zoneName}`, 'info')
    return
  }

  if (permission.value !== 'granted') {
    const granted = await requestPermissionAndSubscribe()
    if (!granted) {
      show('Autorise les notifications pour suivre une zone.', 'error')
      return
    }
  }

  subscribeToZone(zoneId)
  show(`Notifications activées pour ${zoneName}`, 'success')
}
</script>

<template>
  <div class="flex h-full w-full flex-col bg-white">
    <header class="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
      <NuxtLink
        to="/"
        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full active:bg-slate-100"
        aria-label="Retour à la carte"
      >
        <ArrowLeft class="h-5 w-5 text-slate-700" />
      </NuxtLink>
      <div>
        <h1 class="text-lg font-semibold text-slate-900">Mes zones</h1>
        <p class="text-sm text-slate-500">Reçois une alerte quand le courant change chez toi.</p>
      </div>
    </header>

    <div class="relative px-4 pt-3">
      <Search class="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="search"
        type="text"
        inputmode="search"
        placeholder="Rechercher un secteur ou un quartier..."
        class="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
      />
    </div>

    <ul class="flex-1 overflow-y-auto px-2 py-2">
      <li v-for="zone in filteredZones" :key="zone.id">
        <button
          type="button"
          class="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-xl px-3 py-4 text-left active:bg-slate-50"
          @click="toggleZone(zone.id, zone.name)"
        >
          <span class="text-base text-slate-800">{{ zone.name }}</span>
          <component
            :is="isSubscribed(zone.id) ? Bell : BellOff"
            class="h-5 w-5 flex-shrink-0"
            :class="isSubscribed(zone.id) ? 'text-green-600' : 'text-slate-300'"
          />
        </button>
      </li>
      <p v-if="filteredZones.length === 0" class="px-3 py-6 text-center text-sm text-slate-400">
        Aucun secteur ou quartier trouvé.
      </p>
    </ul>
  </div>
</template>
