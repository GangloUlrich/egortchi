<script setup lang="ts">
import { LCircle, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import type { Zone, ZoneStatusEntry } from '~/composables/useZoneStatus'
import { QUARTIERS } from '~/composables/useZoneStatus'

const props = defineProps<{
  zone: Zone
  status: ZoneStatusEntry
}>()

const { submitting, reportToZone, reportZones } = useReports()
const { show } = useToast()

const showQuartiers = ref(false)
/** Quartiers cochés dans le sélecteur "le courant est revenu où ?" (statut mixte uniquement). */
const selectedPowerQuartierIds = ref<Set<string>>(new Set())

/** Tous les quartiers officiels rattachés à ce secteur (pas de granularité d'état en dessous du secteur). */
const quartiersOfZone = computed(() => QUARTIERS.filter((q) => q.secteurId === props.zone.id))

const icon = computed(() => {
  if (props.status.status === 'unknown') return undefined
  const emoji = { power: '⚡', outage: '🔌', mixed: '🔦' }[props.status.status]
  const toneClass = { power: 'zone-icon--power', outage: 'zone-icon--outage', mixed: 'zone-icon--mixed' }[props.status.status]
  return L.divIcon({
    html: `<div class="zone-icon ${toneClass}">${emoji}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  }) as unknown as L.Icon
})

const circleColor = computed(() => {
  if (props.status.status === 'power') return '#16a34a'
  if (props.status.status === 'mixed') return '#f97316'
  return '#dc2626'
})

const statusLabel = computed(() => {
  if (props.status.status === 'power') return '⚡ Courant OK'
  if (props.status.status === 'outage') return '🔌 Coupure en cours'
  if (props.status.status === 'mixed') return '🔦 Coupure partielle'
  return 'État inconnu'
})

function namesFor(ids: string[]) {
  return ids.map((id) => QUARTIERS.find((q) => q.id === id)?.name).filter((name): name is string => !!name)
}

/** Quartiers confirmés en coupure / avec le courant, si connus (signalements manuels, pas géolocalisés). */
const outageQuartierNames = computed(() => namesFor(props.status.outageQuartierIds))
const powerQuartierNames = computed(() => namesFor(props.status.powerQuartierIds))

/** Quartiers encore en coupure dans ce secteur, candidats pour "le courant est revenu où ?" en statut mixte. */
const outageQuartierEntries = computed(() =>
  props.status.outageQuartierIds.map((id) => ({ id, name: QUARTIERS.find((q) => q.id === id)?.name ?? id }))
)

// Hors mixte, un seul des deux statuts est confirmé : on peut titrer le
// popup avec sa liste de quartiers directement.
const titleQuartierNames = computed(() => {
  if (props.status.status === 'outage') return outageQuartierNames.value
  if (props.status.status === 'power') return powerQuartierNames.value
  return []
})
const quartierNamesLabel = computed(() => (titleQuartierNames.value.length > 0 ? titleQuartierNames.value.join(', ') : null))

const sinceLabel = computed(() => {
  if (!props.status.updatedAt) return null
  const minutes = Math.max(0, Math.round((Date.now() - new Date(props.status.updatedAt).getTime()) / 60_000))
  if (minutes < 1) return "à l'instant"
  if (minutes === 1) return 'depuis 1 min'
  return `depuis ${minutes} min`
})

async function reportPowerBack() {
  if (submitting.value) return
  const result = await reportToZone(props.zone, 'power', props.status.outageQuartierIds[0] ?? null)
  if (result.ok) {
    if ('vibrate' in navigator) navigator.vibrate(60)
    show(`⚡ Retour du courant signalé${quartierNamesLabel.value ? ' à ' + quartierNamesLabel.value : ''}`, 'success')
  } else if (result.reason === 'cooldown') {
    show('Déjà signalé récemment. Réessaie plus tard.', 'info')
  } else {
    show('Une erreur est survenue. Réessaie.', 'error')
  }
}

function togglePowerQuartier(id: string) {
  const next = new Set(selectedPowerQuartierIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedPowerQuartierIds.value = next
}

/** Statut mixte : on précise quels quartiers (parmi ceux encore en coupure) ont retrouvé le courant. */
async function reportPowerBackSelected() {
  if (submitting.value || selectedPowerQuartierIds.value.size === 0) return
  const ids = [...selectedPowerQuartierIds.value]
  const results = await reportZones('power', ids)
  selectedPowerQuartierIds.value = new Set()

  const ok = results.filter((r) => r.ok)
  const cooldown = results.filter((r) => !r.ok && r.reason === 'cooldown')

  if (ok.length > 0) {
    if ('vibrate' in navigator) navigator.vibrate(60)
  }

  const parts: string[] = []
  if (ok.length > 0) parts.push(`⚡ Retour du courant signalé pour ${ok.length} quartier${ok.length > 1 ? 's' : ''}`)
  if (cooldown.length > 0) parts.push(`${cooldown.length} déjà signalé${cooldown.length > 1 ? 's' : ''} récemment`)
  show(parts.join(' • ') || 'Une erreur est survenue. Réessaie.', ok.length > 0 ? 'success' : 'error')
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
        <p class="font-semibold text-slate-900">{{ quartierNamesLabel ?? zone.name }}</p>
        <p v-if="quartierNamesLabel" class="text-xs text-slate-400">{{ zone.name }}</p>
        <p class="mt-1">{{ statusLabel }}</p>
        <template v-if="status.status === 'mixed'">
          <p class="text-green-700">⚡ Courant OK : {{ powerQuartierNames.join(', ') || '—' }}</p>
          <p class="text-red-700">🔌 Coupures : {{ outageQuartierNames.join(', ') || '—' }}</p>
        </template>
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

        <template v-if="status.status === 'mixed'">
          <p class="mt-2 text-xs font-medium text-slate-600">Le courant est revenu où ?</p>
          <div class="mt-1 max-h-28 space-y-1 overflow-y-auto">
            <label
              v-for="entry in outageQuartierEntries"
              :key="entry.id"
              class="flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                :checked="selectedPowerQuartierIds.has(entry.id)"
                @change="togglePowerQuartier(entry.id)"
              />
              {{ entry.name }}
            </label>
          </div>
          <button
            type="button"
            :disabled="submitting || selectedPowerQuartierIds.size === 0"
            class="mt-2 w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white active:bg-green-700 disabled:opacity-40"
            @click="reportPowerBackSelected"
          >
            ⚡ Signaler le retour du courant{{ selectedPowerQuartierIds.size > 0 ? ` (${selectedPowerQuartierIds.size})` : '' }}
          </button>
        </template>
        <button
          type="button"
          class="mt-2 w-full text-left text-xs font-medium text-slate-500 underline"
          @click="showQuartiers = !showQuartiers"
        >
          {{ showQuartiers ? 'Masquer' : 'Voir' }} les {{ quartiersOfZone.length }} quartiers de ce secteur
        </button>
        <ul v-if="showQuartiers" class="mt-1 max-h-32 list-disc overflow-y-auto pl-4 text-slate-600">
          <li v-for="quartier in quartiersOfZone" :key="quartier.id">{{ quartier.name }}</li>
        </ul>
      </div>
    </LPopup>
  </LMarker>
</template>
