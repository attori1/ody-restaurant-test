import { getNextAction, isCancellable } from '../lib/order-ui'

describe('getNextAction (UI flow)', () => {
  it('propose la bonne action pour chaque étape active', () => {
    expect(getNextAction('pending')).toEqual({ status: 'confirmed', label: 'Confirm' })
    expect(getNextAction('confirmed')).toEqual({ status: 'preparing', label: 'Start Preparing' })
    expect(getNextAction('preparing')).toEqual({ status: 'ready', label: 'Mark Ready' })
    expect(getNextAction('ready')).toEqual({ status: 'delivered', label: 'Mark Delivered' })
  })

  it('ne propose aucune action pour les états terminaux', () => {
    expect(getNextAction('delivered')).toBeUndefined()
    expect(getNextAction('cancelled')).toBeUndefined()
  })
})

describe('isCancellable', () => {
  it('autorise l’annulation seulement avant la préparation', () => {
    expect(isCancellable('pending')).toBe(true)
    expect(isCancellable('confirmed')).toBe(true)
    expect(isCancellable('preparing')).toBe(false)
    expect(isCancellable('ready')).toBe(false)
    expect(isCancellable('delivered')).toBe(false)
  })
})
