import { useQueryClient } from '@tanstack/react-query'
import {
  useGetApiOrders,
  useGetApiOrdersId,
  usePostApiOrdersIdStatus,
  getGetApiOrdersQueryKey,
  type PostApiOrdersIdStatusBodyStatus,
} from '@ody/api-client'
import { getNextAction, type OrderStatus } from '@ody/types'

export type { OrderStatus }

export function useOrders(statusFilter?: OrderStatus) {
  const queryClient = useQueryClient()

  const ordersQuery = useGetApiOrders(statusFilter ? { status: statusFilter } : undefined)

  const statusMutation = usePostApiOrdersIdStatus({
    mutation: {
      onSuccess: () => {
        // On rafraîchit la liste après une transition réussie
        queryClient.invalidateQueries({ queryKey: getGetApiOrdersQueryKey() })
      },
    },
  })

  return {
    orders: ordersQuery.data ?? [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    getNextAction,
    updateStatus: (id: string, status: PostApiOrdersIdStatusBodyStatus) =>
      statusMutation.mutateAsync({ id, data: { status } }),
    isUpdating: statusMutation.isPending,
  }
}

/** Hook séparé pour le détail d'une commande (chargé seulement quand un id est sélectionné). */
export function useOrderDetail(id: string | null) {
  return useGetApiOrdersId(id ?? '', {
    query: { enabled: !!id },
  })
}
