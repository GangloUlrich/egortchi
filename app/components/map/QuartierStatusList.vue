<script setup lang="ts">
import { List, Search, X } from '@lucide/vue'
import { QUARTIERS, ZONES, type ZoneState } from '~/composables/useZoneStatus'

const { getStatus } = useZoneStatus()

const open = ref(false)
const search = ref('')
const activeTab = ref<'outage' | 'power'>('outage')

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const secteurNameById = computed(() => {
  const map = new Map<string, string>()
  for (const zone of ZONES) map.set(zone.id, zone.name)
  return map
})

interface Row {
  id: string
  name: string
  secteurName: string
  status: ZoneState
}

const allRows = computed<Row[]>(() =>
  QUARTIERS.map((quartier) => ({
    id: quartier.id,
    name: quartier.name,
    secteurName: secteurNameById.value.get(quartier.secteurId) ?? '',
    status: getStatus(quartier.secteurId).status,
  })).sort((a, b) => a.name.localeCompare(b.name))
)

const outageRows = computed(() => allRows.value.filter((r) => r.status === 'outage'))
const powerRows = computed(() => allRows.value.filter((r) => r.status === 'power'))

const visibleRows = computed(() => {
  const source = activeTab.value === 'outage' ? outageRows.value : powerRows.value
  const q = normalize(search.value.trim())
  if (!q) return source
  return source.filter((row) => normalize(row.name).includes(q) || normalize(row.secteurName).includes(q))
})

function closeDialog() {
  open.value = false
  search.value = ''
  activeTab.value = 'outage'
}
</script>

<template>
  <button
    type="button"
    class="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg active:scale-95"
    aria-label="Voir l'état des quartiers"
    @click="open = true"
  >
    <List class="h-5 w-5 text-slate-700" />
  </button>

  <div
    v-if="open"
    class="fixed inset-0 z-[2100] flex items-end justify-center bg-black/40 sm:items-center"
    @click.self="closeDialog"
  >
    <div class="flex h-[80vh] w-full max-w-md flex-col rounded-t-2xl bg-white p-4 pb-[calc(1rem+var(--safe-bottom))] sm:h-[70vh] sm:rounded-2xl">
      <div class="mb-3 flex items-center justify-between">
        <p class="text-base font-semibold text-slate-900">État des quartiers</p>
        <button type="button" aria-label="Fermer" @click="closeDialog">
          <X class="h-5 w-5 text-slate-500" />
        </button>
      </div>

      <div class="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-sm font-semibold transition"
          :class="activeTab === 'outage' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'"
          @click="activeTab = 'outage'"
        >
          🔌 Coupures ({{ outageRows.length }})
        </button>
        <button
          type="button"
          class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-sm font-semibold transition"
          :class="activeTab === 'power' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500'"
          @click="activeTab = 'power'"
        >
          ⚡ Courant revenu ({{ powerRows.length }})
        </button>
      </div>

      <div class="relative mb-3">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="search"
          type="text"
          inputmode="search"
          placeholder="Rechercher un quartier..."
          class="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
        />
      </div>

      <div class="flex-1 space-y-1 overflow-y-auto">
        <div
          v-for="row in visibleRows"
          :key="row.id"
          class="flex items-center justify-between gap-2 rounded-lg px-2 py-2"
        >
          <div>
            <p class="text-sm text-slate-800">{{ row.name }}</p>
            <p class="text-xs text-slate-400">{{ row.secteurName }}</p>
          </div>
          <span class="shrink-0 text-lg">{{ activeTab === 'outage' ? '🔌' : '⚡' }}</span>
        </div>

        <p v-if="visibleRows.length === 0" class="px-3 py-6 text-center text-sm text-slate-400">
          {{ activeTab === 'outage' ? 'Aucune coupure en cours.' : 'Aucun quartier avec le courant rétabli pour le moment.' }}
        </p>
      </div>
    </div>
  </div>
</template>
