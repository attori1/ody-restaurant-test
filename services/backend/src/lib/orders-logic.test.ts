import { describe, it, expect } from 'vitest'
import { canTransition, validateAndPriceOrder, VALID_TRANSITIONS, type PricedMenuItem } from './orders-logic'

const MENU: PricedMenuItem[] = [
  { id: 'salmon', name: 'Grilled Salmon', price: '24.00', available: true },
  { id: 'burger', name: 'Beef Burger', price: '18.50', available: true },
  { id: 'wine', name: 'House Red Wine', price: '7.00', available: false }, // indisponible
]

describe('canTransition (state machine)', () => {
  it('autorise les transitions valides du flux normal', () => {
    expect(canTransition('pending', 'confirmed')).toBe(true)
    expect(canTransition('confirmed', 'preparing')).toBe(true)
    expect(canTransition('preparing', 'ready')).toBe(true)
    expect(canTransition('ready', 'delivered')).toBe(true)
  })

  it('autorise l’annulation depuis pending et confirmed', () => {
    expect(canTransition('pending', 'cancelled')).toBe(true)
    expect(canTransition('confirmed', 'cancelled')).toBe(true)
  })

  it('refuse les sauts d’étape', () => {
    expect(canTransition('pending', 'delivered')).toBe(false)
    expect(canTransition('confirmed', 'delivered')).toBe(false)
    expect(canTransition('pending', 'ready')).toBe(false)
  })

  it('refuse toute transition depuis un état terminal', () => {
    expect(canTransition('delivered', 'pending')).toBe(false)
    expect(canTransition('cancelled', 'confirmed')).toBe(false)
    expect(VALID_TRANSITIONS.delivered).toHaveLength(0)
    expect(VALID_TRANSITIONS.cancelled).toHaveLength(0)
  })

  it('refuse de revenir en arrière', () => {
    expect(canTransition('preparing', 'pending')).toBe(false)
    expect(canTransition('ready', 'preparing')).toBe(false)
  })
})

describe('validateAndPriceOrder (server-side pricing)', () => {
  it('calcule le total correctement', () => {
    const result = validateAndPriceOrder(
      [{ menuItemId: 'salmon', quantity: 2 }, { menuItemId: 'burger', quantity: 1 }],
      MENU
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.totalAmount).toBe('66.50') // 24*2 + 18.50
      expect(result.lines).toHaveLength(2)
      expect(result.lines[0].subtotal).toBe('48.00')
    }
  })

  it('rejette une commande vide', () => {
    const result = validateAndPriceOrder([], MENU)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/at least one/i)
  })

  it('rejette un item inexistant', () => {
    const result = validateAndPriceOrder([{ menuItemId: 'ghost', quantity: 1 }], MENU)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/not found/i)
  })

  it('rejette un item indisponible', () => {
    const result = validateAndPriceOrder([{ menuItemId: 'wine', quantity: 1 }], MENU)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/not available/i)
  })

  it('rejette une quantité invalide', () => {
    const result = validateAndPriceOrder([{ menuItemId: 'salmon', quantity: 0 }], MENU)
    expect(result.ok).toBe(false)
  })

  it('ne fait jamais confiance au prix du client — utilise le prix en base', () => {
    // Même si le client "voulait" un autre prix, seul le prix du menu compte
    const result = validateAndPriceOrder([{ menuItemId: 'burger', quantity: 3 }], MENU)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.totalAmount).toBe('55.50') // 18.50 * 3
  })
})
