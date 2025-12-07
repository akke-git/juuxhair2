import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api'

export function useAdminStyles() {
  const queryClient = useQueryClient()

  const stylesQuery = useQuery({
    queryKey: ['styles'],
    queryFn: adminApi.getStyles,
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, name }: { file: File; name?: string }) =>
      adminApi.uploadStyle(file, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteStyle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] })
    },
  })

  return {
    styles: Array.isArray(stylesQuery.data) ? stylesQuery.data : [],
    isLoading: stylesQuery.isLoading,
    error: stylesQuery.error,
    refetch: stylesQuery.refetch,
    uploadStyle: (file: File, name?: string) =>
      uploadMutation.mutateAsync({ file, name }),
    isUploading: uploadMutation.isPending,
    deleteStyle: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
