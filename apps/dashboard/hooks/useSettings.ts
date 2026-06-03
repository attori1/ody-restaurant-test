import { useQueryClient } from '@tanstack/react-query'
import {
  useGetApiSettings,
  usePatchApiSettings,
  getGetApiSettingsQueryKey,
  type PatchApiSettingsBody,
} from '@ody/api-client'

/**
 * Hook métier pour les réglages du restaurant.
 * Lecture + mise à jour, avec invalidation du cache au succès.
 */
export function useSettings() {
  const queryClient = useQueryClient()
  const settingsQuery = useGetApiSettings()

  const patch = usePatchApiSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiSettingsQueryKey() })
      },
    },
  })

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    updateSettings: (data: PatchApiSettingsBody) => patch.mutateAsync({ data }),
    isSaving: patch.isPending,
  }
}
