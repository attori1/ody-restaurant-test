import { getNextAction, isCancellable } from '@ody/types'

// Test frontend : vérifie la logique de flux des commandes telle que la page Orders
// la consomme (quelle action proposer, quand afficher le bouton Annuler).
describe('order flow (consommé par la page Orders)', () => {
  it('propose la bonne action selon le statut', () => {
    expect(getNextAction('pending')?.label).toBe('Confirm')
    expect(getNextAction('preparing')?.label).toBe('Mark Ready')
    expect(getNextAction('delivered')).toBeUndefined()
  })

  it('n’autorise l’annulation qu’avant la préparation', () => {
    expect(isCancellable('pending')).toBe(true)
    expect(isCancellable('confirmed')).toBe(true)
    expect(isCancellable('preparing')).toBe(false)
    expect(isCancellable('delivered')).toBe(false)
  })
})
