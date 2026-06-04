/**
 * Logique de présentation pure pour les commandes (aucun import RN/réseau).
 * Détermine l'action « suivante » proposée dans l'UI selon le statut.
 *
 * ⚠️ Ce n'est PAS le contrat de données : les types des commandes réelles viennent
 * du client généré (@ody/api-client, ex. GetApiOrders200ItemStatus), eux-mêmes dérivés
 * du schéma Drizzle. Le `OrderStatus` ci-dessous ne sert qu'aux helpers d'affichage ;
 * un garde de type dans le dashboard (hooks/useOrders.ts) vérifie qu'il reste aligné
 * sur l'enum du contrat généré. La validation réelle des transitions est faite par le
 * backend (services/backend/src/lib/orders-logic.ts).
 */

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
export type TransitionStatus = 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export interface NextAction {
  status: TransitionStatus
  label: string
}

const NEXT_ACTION: Partial<Record<OrderStatus, NextAction>> = {
  pending: { status: 'confirmed', label: 'Confirm' },
  confirmed: { status: 'preparing', label: 'Start Preparing' },
  preparing: { status: 'ready', label: 'Mark Ready' },
  ready: { status: 'delivered', label: 'Mark Delivered' },
}

export function getNextAction(status: OrderStatus): NextAction | undefined {
  return NEXT_ACTION[status]
}

/** Vrai si la commande peut encore être annulée depuis l'UI. */
export function isCancellable(status: OrderStatus): boolean {
  return status === 'pending' || status === 'confirmed'
}
