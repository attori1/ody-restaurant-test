import { useQueryClient } from '@tanstack/react-query'
import {
  useGetApiOrders,
  useGetApiOrdersId,
  usePostApiOrdersIdStatus,
  getGetApiOrdersQueryKey,
  getGetApiOrdersIdQueryKey,
  type GetApiOrders200ItemStatus,
  type PostApiOrdersIdStatusBodyStatus,
} from '@ody/api-client'

export type OrderStatus = GetApiOrders200ItemStatus

/**
 * Transitions proposées côté UI pour le bouton d'action principal.
 * ⚠️ Ce n'est PAS la source de vérité : le backend valide réellement la transition
 * (voir VALID_TRANSITIONS dans services/backend/src/routes/orders.ts).
 * Ici on ne fait que proposer l'action « suivante » naturelle dans le flux.
 */
const NEXT_ACTION: Partial<Record<OrderStatus, { status: PostApiOrdersIdStatusBodyStatus; label: string }>> = {
  pending: { status: 'confirmed', label: 'Confirm' },
  confirmed: { status: 'preparing', label: 'Start Preparing' },
  preparing: { status: 'ready', label: 'Mark Ready' },
  ready: { status: 'delivered', label: 'Mark Delivered' },
}

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
    getNextAction: (status: OrderStatus) => NEXT_ACTION[status],
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
