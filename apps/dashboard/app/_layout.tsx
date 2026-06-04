import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { ToastProvider } from '@ody/shared'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

// QueryClientProvider enveloppe toute l'app pour que React Query fonctionne.
// React Query gère le cache des données : si tu appelles useGetOrders() sur deux pages,
// la deuxième page utilise les données déjà chargées plutôt que de refaire une requête.
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ToastProvider>
    </QueryClientProvider>
  )
}
