import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { galleryApi } from '../api'

export function useGallery() {
  const queryClient = useQueryClient()

  const historyQuery = useQuery({
    queryKey: ['synthesisHistory'],
    queryFn: galleryApi.getHistory,
  })

  const deleteMutation = useMutation({
    mutationFn: galleryApi.deleteHistoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synthesisHistory'] })
    },
  })

  return {
    history: historyQuery.data ?? [],
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,
    refetch: historyQuery.refetch,
    deleteItem: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}

export function useGalleryItem(id: string) {
  return useQuery({
    queryKey: ['synthesisHistory', id],
    queryFn: () => galleryApi.getHistoryItem(id),
    enabled: !!id,
  })
}
