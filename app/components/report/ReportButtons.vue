<script setup lang="ts">
import { Lightbulb, LightbulbOff, ListChecks, Search } from '@lucide/vue'
import { ZONES, QUARTIERS } from '~/composables/useZoneStatus'
import type { ReportResult, ReportStatus } from '~/composables/useReports'

const { submitting, report, reportZones } = useReports()
const { show } = useToast()

const showZonePicker = ref(false)
/** true quand le picker a été ouvert manuellement (pas en fallback géoloc) : permet de changer le statut dans le picker. */
const multiMode = ref(false)
const pendingStatus = ref<ReportStatus | null>(null)
/** ids de QUARTIERS.id (pas de secteur) : chaque quartier est signalé/trackè individuellement. */
const selectedQuartierIds = ref<Set<string>>(new Set())
const quartierSearch = ref('')

const secteurNameById = computed(() => {
  const map = new Map<string, string>()
  for (const zone of ZONES) map.set(zone.id, zone.name)
  return map
})

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const filteredQuartiers = computed(() => {
  const q = normalize(quartierSearch.value.trim())
  if (!q) return QUARTIERS
  return QUARTIERS.filter((quartier) => normalize(quartier.name).includes(q))
})

function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern)
}

async function handleResult(status: ReportStatus, result: ReportResult) {
  if (result.ok) {
    vibrate(status === 'outage' ? [0, 60, 40, 60] : 60)
    show(
      status === 'outage'
        ? `🔌 Coupure signalée${result.zone ? ' à ' + result.zone.name : ''}`
        : `⚡ Retour du courant signalé${result.zone ? ' à ' + result.zone.name : ''}`,
      'success'
    )
    return
  }

  switch (result.reason) {
    case 'geo_denied':
      openZonePicker(status, false)
      break
    case 'cooldown':
      show(`Déjà signalé${result.zone ? ' pour ' + result.zone.name : ''} récemment. Réessaie plus tard.`, 'info')
      break
    case 'out_of_area':
      show('Hors de la zone couverte (Cotonou / Abomey-Calavi) pour le moment.', 'error')
      break
    case 'low_accuracy':
      show('Signal GPS trop imprécis. Choisis ton quartier dans la liste.', 'error')
      openZonePicker(status, false)
      break
    default:
      show('Une erreur est survenue. Réessaie.', 'error')
  }
}

async function handleTap(status: ReportStatus) {
  if (submitting.value) return
  quartierSearch.value = ''
  const result = await report(status)
  await handleResult(status, result)
}

function openZonePicker(status: ReportStatus, multi: boolean) {
  pendingStatus.value = status
  multiMode.value = multi
  selectedQuartierIds.value = new Set()
  quartierSearch.value = ''
  showZonePicker.value = true
}

function toggleQuartier(quartierId: string) {
  const next = new Set(selectedQuartierIds.value)
  if (next.has(quartierId)) next.delete(quartierId)
  else next.add(quartierId)
  selectedQuartierIds.value = next

  // Fallback géoloc (pas multi) : un tap suffit, comportement inchangé.
  if (!multiMode.value) validateSelection()
}

async function validateSelection() {
  if (!pendingStatus.value || selectedQuartierIds.value.size === 0) return
  const status = pendingStatus.value
  const quartierIds = [...selectedQuartierIds.value]
  showZonePicker.value = false
  pendingStatus.value = null
  selectedQuartierIds.value = new Set()
  quartierSearch.value = ''

  const results = await reportZones(status, quartierIds)

  // Une seule zone choisie (fallback géoloc, ou multi-sélection réduite à un
  // quartier) : on garde le message/vibration habituel.
  if (results.length === 1) {
    await handleResult(status, results[0]!)
    return
  }

  const ok = results.filter((r) => r.ok)
  const cooldown = results.filter((r) => !r.ok && r.reason === 'cooldown')

  if (ok.length > 0) {
    vibrate(status === 'outage' ? [0, 60, 40, 60] : 60)
  }

  const label = status === 'outage' ? '🔌 Coupure signalée' : '⚡ Retour du courant signalé'
  const parts: string[] = []
  if (ok.length > 0) parts.push(`${label} pour ${ok.length} quartier${ok.length > 1 ? 's' : ''}`)
  if (cooldown.length > 0) parts.push(`${cooldown.length} déjà signalé${cooldown.length > 1 ? 's' : ''} récemment`)
  show(parts.join(' • ') || 'Une erreur est survenue. Réessaie.', ok.length > 0 ? 'success' : 'error')
}

function closeZonePicker() {
  showZonePicker.value = false
  pendingStatus.value = null
  multiMode.value = false
  selectedQuartierIds.value = new Set()
  quartierSearch.value = ''
}
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-[2000] flex flex-col items-center px-4 pb-[calc(1rem+var(--safe-bottom))]"
  >
    <div class="pointer-events-auto grid w-full max-w-md grid-cols-2 gap-3">
      <button
        type="button"
        :disabled="submitting"
        class="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-4 text-lg font-semibold text-white shadow-lg transition active:scale-95 active:bg-red-700 disabled:opacity-60"
        @click="handleTap('outage')"
      >
        <LightbulbOff class="h-6 w-6" />
        Coupure
      </button>

      <button
        type="button"
        :disabled="submitting"
        class="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-4 text-lg font-semibold text-white shadow-lg transition active:scale-95 active:bg-green-700 disabled:opacity-60"
        @click="handleTap('power')"
      >
        <Lightbulb class="h-6 w-6" />
        Le courant est là
      </button>
    </div>

    <button
      type="button"
      class="pointer-events-auto mt-2 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow"
      @click="openZonePicker('outage', true)"
    >
      <ListChecks class="h-3.5 w-3.5" />
      Signaler plusieurs quartiers
    </button>
  </div>

  <!-- Choix manuel du quartier : fallback géoloc (sélection simple) ou multi-signalement (plusieurs quartiers) -->
  <div
    v-if="showZonePicker"
    class="fixed inset-0 z-[2100] flex items-end justify-center bg-black/40 sm:items-center"
    @click.self="closeZonePicker"
  >
    <div class="flex w-full max-w-md flex-col rounded-t-2xl bg-white p-4 pb-[calc(1rem+var(--safe-bottom))] sm:rounded-2xl">
      <p class="mb-3 text-center text-base font-semibold text-slate-900">
        {{ multiMode ? 'Choisis un ou plusieurs quartiers' : 'Choisis ton quartier' }}
      </p>

      <div v-if="multiMode" class="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-sm font-semibold transition"
          :class="pendingStatus === 'outage' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'"
          @click="pendingStatus = 'outage'"
        >
          <LightbulbOff class="h-4 w-4" />
          Coupure
        </button>
        <button
          type="button"
          class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-sm font-semibold transition"
          :class="pendingStatus === 'power' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500'"
          @click="pendingStatus = 'power'"
        >
          <Lightbulb class="h-4 w-4" />
          Le courant est là
        </button>
      </div>

      <div class="relative mb-2">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="quartierSearch"
          type="text"
          inputmode="search"
          placeholder="Rechercher un quartier..."
          class="w-full rounded-lg border border-slate-200 py-3 pl-9 pr-3 text-base text-slate-800 focus:border-slate-400 focus:outline-none"
        />
      </div>

      <div class="max-h-[50vh] space-y-1 overflow-y-auto">
        <button
          v-for="quartier in filteredQuartiers"
          :key="quartier.id"
          type="button"
          class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-3 text-left active:bg-slate-100"
          :class="selectedQuartierIds.has(quartier.id) ? 'bg-slate-100' : ''"
          @click="toggleQuartier(quartier.id)"
        >
          <span class="text-base text-slate-800">{{ quartier.name }}</span>
          <span class="flex shrink-0 items-center gap-2">
            <span class="text-xs text-slate-400">{{ secteurNameById.get(quartier.secteurId) }}</span>
            <span
              v-if="multiMode"
              class="flex h-5 w-5 items-center justify-center rounded-full border text-[11px]"
              :class="selectedQuartierIds.has(quartier.id) ? 'border-slate-700 bg-slate-700 text-white' : 'border-slate-300 text-transparent'"
            >
              ✓
            </span>
          </span>
        </button>
        <p v-if="filteredQuartiers.length === 0" class="px-3 py-6 text-center text-sm text-slate-400">
          Aucun quartier trouvé.
        </p>
      </div>

      <button
        v-if="multiMode"
        type="button"
        :disabled="selectedQuartierIds.size === 0"
        class="mt-3 min-h-[48px] w-full rounded-xl text-base font-semibold text-white transition disabled:opacity-40"
        :class="pendingStatus === 'outage' ? 'bg-red-600' : 'bg-green-600'"
        @click="validateSelection"
      >
        Valider{{ selectedQuartierIds.size > 0 ? ` (${selectedQuartierIds.size})` : '' }}
      </button>

      <button
        type="button"
        class="mt-2 w-full rounded-lg px-3 py-3 text-center text-sm font-medium text-slate-500"
        @click="closeZonePicker"
      >
        Annuler
      </button>
    </div>
  </div>
</template>
