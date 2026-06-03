import { defineConfig } from 'orval'

export default defineConfig({
  restaurant: {
    input: {
      // Orval lit le schéma OpenAPI exposé par le backend en local
      target: 'http://localhost:8787/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/generated',
      schemas: './src/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          // Fichier d'instance axios personnalisé pour configurer l'URL de base
          path: './src/axios-instance.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
})
