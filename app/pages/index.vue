<script setup lang="ts">
import { Bell } from '@lucide/vue'
import PowerMap from '~/components/map/PowerMap.vue'
import QuartierStatusList from '~/components/map/QuartierStatusList.vue'
import ReportButtons from '~/components/report/ReportButtons.vue'
</script>

<template>
  <div class="relative h-full w-full">
    <ClientOnly>
      <PowerMap />
      <template #fallback>
        <div class="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500">
          Chargement de la carte...
        </div>
      </template>
    </ClientOnly>

    <div class="absolute right-4 top-4 z-[2000] flex items-center gap-2">
      <NuxtLink
        to="/zones"
        class="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg active:scale-95"
        aria-label="Gérer mes zones suivies"
      >
        <Bell class="h-5 w-5 text-slate-700" />
      </NuxtLink>
      <QuartierStatusList />
    </div>

    <ReportButtons />
  </div>
</template>
