/**
 * Logique métier pure des commandes — sans dépendance à la base de données.
 * Extraite ici pour être testable unitairement et réutilisable dans les routes.
 */

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

/** Machine à états : transitions autorisées depuis chaque statut. */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['delivered'],
  delivered: [],
  cancelled: [],
}

/** Vrai si la transition `from → to` est autorisée. */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

export interface PricedMenuItem {
  id: string
  name: string
  price: string
  available: boolean
}

export interface RequestedItem {
  menuItemId: string
  quantity: number
}

export type ValidationResult =
  | { ok: true; totalAmount: string; lines: { menuItemId: string; quantity: number; unitPrice: string; subtotal: string }[] }
  | { ok: false; error: string }

/**
 * Valide les items d'une commande et calcule le total côté serveur.
 * - rejette un item inexistant
 * - rejette un item indisponible
 * - calcule chaque sous-total et le total à partir des prix en base (jamais du client)
 */
export function validateAndPriceOrder(
  requested: RequestedItem[],
  menuItems: PricedMenuItem[]
): ValidationResult {
  if (requested.length === 0) {
    return { ok: false, error: 'Order must contain at least one item' }
  }

  const lines: { menuItemId: string; quantity: number; unitPrice: string; subtotal: string }[] = []
  let total = 0

  for (const req of requested) {
    const item = menuItems.find((m) => m.id === req.menuItemId)
    if (!item) {
      return { ok: false, error: `Menu item ${req.menuItemId} not found` }
    }
    if (!item.available) {
      return { ok: false, error: `"${item.name}" is not available` }
    }
    if (req.quantity < 1) {
      return { ok: false, error: `Invalid quantity for "${item.name}"` }
    }
    const subtotal = parseFloat(item.price) * req.quantity
    total += subtotal
    lines.push({
      menuItemId: item.id,
      quantity: req.quantity,
      unitPrice: item.price,
      subtotal: subtotal.toFixed(2),
    })
  }

  return { ok: true, totalAmount: total.toFixed(2), lines }
}
