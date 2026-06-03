import { useQueryClient } from '@tanstack/react-query'
import {
  useGetApiMenuItems,
  useGetApiMenuCategories,
  usePostApiMenuItems,
  usePatchApiMenuItemsId,
  useDeleteApiMenuItemsId,
  getGetApiMenuItemsQueryKey,
  type PostApiMenuItemsBody,
  type PatchApiMenuItemsIdBody,
} from '@ody/api-client'

/**
 * Hook métier pour la page Menu.
 * Il enveloppe les hooks générés par Orval et centralise :
 *  - le fetch des items + catégories
 *  - les mutations (créer / éditer / supprimer)
 *  - l'invalidation du cache après chaque mutation (refetch automatique)
 *
 * La page Menu n'a ainsi aucune logique de données : elle consomme juste ce hook.
 */
export function useMenu(categoryId?: string) {
  const queryClient = useQueryClient()

  // Quand une mutation réussit, on invalide la query des items.
  // React Query refait alors automatiquement le fetch et l'UI se met à jour.
  const invalidateItems = () => {
    queryClient.invalidateQueries({ queryKey: getGetApiMenuItemsQueryKey() })
  }

  const itemsQuery = useGetApiMenuItems(categoryId ? { categoryId } : undefined)
  const categoriesQuery = useGetApiMenuCategories()

  const createItem = usePostApiMenuItems({
    mutation: { onSuccess: invalidateItems },
  })
  const updateItem = usePatchApiMenuItemsId({
    mutation: { onSuccess: invalidateItems },
  })
  const deleteItem = useDeleteApiMenuItemsId({
    mutation: { onSuccess: invalidateItems },
  })

  return {
    // Données
    items: itemsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    // États de chargement
    isLoading: itemsQuery.isLoading || categoriesQuery.isLoading,
    isError: itemsQuery.isError || categoriesQuery.isError,
    // Actions
    createItem: (data: PostApiMenuItemsBody) => createItem.mutateAsync({ data }),
    updateItem: (id: string, data: PatchApiMenuItemsIdBody) => updateItem.mutateAsync({ id, data }),
    deleteItem: (id: string) => deleteItem.mutateAsync({ id }),
    // États des mutations
    isSaving: createItem.isPending || updateItem.isPending,
  }
}
