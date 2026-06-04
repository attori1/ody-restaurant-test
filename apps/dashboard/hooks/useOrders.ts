import { useQueryClient } from '@tanstack/react-query'
import {
  useGetApiOrders,
  useGetApiOrdersId,
  usePostApiOrdersIdStatus,
  getGetApiOrdersQueryKey,
  type PostApiOrdersIdStatusBodyStatus,
  type GetApiOrders200ItemStatus,
} from '@ody/api-client'
import { getNextAction, type OrderStatus } from '@ody/types'

// Garde de type (compile-time) : le OrderStatus des helpers d'UI (@ody/types) doit rester
// exactement aligné sur l'enum du contrat généré. Si le schéma Drizzle change, ceci casse.
type AssertExact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never
const _statusInSyncWithContract: AssertExact<OrderStatus, GetApiOrders200ItemStatus> = true
void _statusInSyncWithContract

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
