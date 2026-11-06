export interface ToastMessage {
  id: number
  text: string
  tone: 'success' | 'error' | 'info'
}

let counter = 0

/** Toast simple et singleton, affiché par app.vue, déclenché depuis n'importe quel composant. */
export function useToast() {
  const toasts = useState<ToastMessage[]>('toasts', () => [])

  function show(text: string, tone: ToastMessage['tone'] = 'info', durationMs = 3000) {
    const id = ++counter
    toasts.value = [...toasts.value, { id, text, tone }]
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, durationMs)
  }

  return { toasts, show }
}
