<script setup lang="ts">
import { Lightbulb, LightbulbOff } from '@lucide/vue'
import { ZONES } from '~/composables/useZoneStatus'
import type { ReportResult, ReportStatus } from '~/composables/useReports'

const { submitting, report } = useReports()
const { show } = useToast()

const showZonePicker = ref(false)
const pendingStatus = ref<ReportStatus | null>(null)

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
      pendingStatus.value = status
      showZonePicker.value = true
      break
    case 'cooldown':
      show(`Déjà signalé${result.zone ? ' pour ' + result.zone.name : ''} récemment. Réessaie plus tard.`, 'info')
      break
    case 'out_of_area':
      show('Hors de la zone couverte (Cotonou / Abomey-Calavi) pour le moment.', 'error')
      break
    case 'low_accuracy':
      show('Signal GPS trop imprécis. Choisis ton quartier dans la liste.', 'error')
      pendingStatus.value = status
      showZonePicker.value = true
      break
    default:
      show('Une erreur est survenue. Réessaie.', 'error')
  }
}

async function handleTap(status: ReportStatus) {
  if (submitting.value) return
  const result = await report(status)
  await handleResult(status, result)
}

async function pickZone(zoneId: string) {
  showZonePicker.value = false
  if (!pendingStatus.value) return
  const status = pendingStatus.value
  pendingStatus.value = null
  const result = await report(status, zoneId)
  await handleResult(status, result)
}
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-[2000] flex justify-center px-4 pb-[calc(1rem+var(--safe-bottom))]"
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
  </div>

  <!-- Fallback : géolocalisation refusée / imprécise -> choix manuel du quartier -->
  <div
    v-if="showZonePicker"
    class="fixed inset-0 z-[2100] flex items-end justify-center bg-black/40 sm:items-center"
    @click.self="showZonePicker = false"
  >
    <div class="w-full max-w-md rounded-t-2xl bg-white p-4 pb-[calc(1rem+var(--safe-bottom))] sm:rounded-2xl">
      <p class="mb-3 text-center text-base font-semibold text-slate-900">Choisis ton quartier</p>
      <div class="max-h-[60vh] space-y-1 overflow-y-auto">
        <button
          v-for="zone in ZONES"
          :key="zone.id"
          type="button"
          class="block w-full rounded-lg px-3 py-3 text-left text-base text-slate-800 active:bg-slate-100"
          @click="pickZone(zone.id)"
        >
          {{ zone.name }}
        </button>
      </div>
      <button
        type="button"
        class="mt-2 w-full rounded-lg px-3 py-3 text-center text-sm font-medium text-slate-500"
        @click="showZonePicker = false"
      >
        Annuler
      </button>
    </div>
  </div>
</template>
