<script setup lang="ts">
const { toasts } = useToast()

const toneClass: Record<string, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-slate-800',
}
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-3 z-[2200] flex flex-col items-center gap-2 px-4">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="max-w-sm rounded-xl px-4 py-3 text-center text-sm font-medium text-white shadow-lg"
        :class="toneClass[toast.tone]"
      >
        {{ toast.text }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
