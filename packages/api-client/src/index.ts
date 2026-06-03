// Ce fichier est le point d'entrée du package api-client.
// Il re-exporte tout ce qu'Orval a généré + l'instance axios configurée.
// Le dashboard importe depuis '@ody/api-client', jamais depuis les fichiers générés directement.

export { axiosInstance } from './axios-instance'
export * from './generated/menu/menu'
export * from './generated/orders/orders'
export * from './generated/customers/customers'
export * from './generated/settings/settings'
export * from './generated/analytics/analytics'
export * from './generated/models'
