import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api'

export function useAdminStyles() {
  const queryClient = useQueryClient()

  const stylesQuery = useQuery({
    queryKey: ['styles'],
    queryFn: adminApi.getStyles,
  })

  const uploadMutation = useMutation({
    mutationFn: ({ 
      file, 
      name,
      tags,
      gender,
      category
    }: { 
      file: File; 
      name?: string;
      tags?: string[];
      gender?: string;
      category?: string;
    }) =>
      adminApi.uploadStyle(file, name, tags, gender, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] })
    },
    onError: (error) => {
      console.error('Failed to upload style:', error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteStyle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] })
    },
    onError: (error) => {
      console.error('Failed to delete style:', error)
    },
  })

  return {
    styles: Array.isArray(stylesQuery.data) ? stylesQuery.data : [],
    isLoading: stylesQuery.isLoading,
    error: stylesQuery.error,
    refetch: stylesQuery.refetch,
    uploadStyle: (
      file: File, 
      name?: string, 
      tags?: string[], 
      gender?: string, 
      category?: string
    ) =>
      uploadMutation.mutateAsync({ file, name, tags, gender, category }),
    isUploading: uploadMutation.isPending,
    deleteStyle: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
