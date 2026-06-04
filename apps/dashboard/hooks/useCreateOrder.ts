import { useQueryClient } from '@tanstack/react-query'
import {
  usePostApiOrders,
  getGetApiOrdersQueryKey,
  getGetApiAnalyticsKpisQueryKey,
  getGetApiCustomersQueryKey,
  type PostApiOrdersBody,
} from '@ody/api-client'

/**
 * Hook métier pour créer une commande.
 * Au succès, invalide les listes impactées : commandes, KPIs de la Home, et
 * les stats clients (dépense / nombre de commandes).
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()

  const mutation = usePostApiOrders({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiOrdersQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetApiAnalyticsKpisQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetApiCustomersQueryKey() })
      },
    },
  })

  return {
    createOrder: (data: PostApiOrdersBody) => mutation.mutateAsync({ data }),
    isCreating: mutation.isPending,
  }
}
