import Axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

const BASE_URL =
  typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL
    : 'http://localhost:8787'

const instance = Axios.create({ baseURL: BASE_URL })

// Orval va appeler cette fonction pour chaque requête générée.
// Elle enveloppe axios et retourne directement les données (pas l'objet réponse complet).
export const axiosInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return instance(config).then((response) => response.data as T)
}

export default axiosInstance
