<script setup lang="ts">
import { ArrowLeft, Bell, BellOff } from '@lucide/vue'
import { ZONES } from '~/composables/useZoneStatus'

const { permission, isSubscribed, subscribeToZone, unsubscribeFromZone, requestPermissionAndSubscribe } =
  usePushSubscription()
const { show } = useToast()

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

    <ul class="flex-1 overflow-y-auto px-2 py-2">
      <li v-for="zone in ZONES" :key="zone.id">
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
    </ul>
  </div>
</template>
