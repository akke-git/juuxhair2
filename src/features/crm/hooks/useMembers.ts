import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { memberApi } from '../api'
import { CreateMemberRequest, UpdateMemberRequest } from '../../../types'

export function useMembers(searchQuery?: string) {
  const queryClient = useQueryClient()

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: memberApi.getMembers,
  })

  const filteredMembers = searchQuery
    ? membersQuery.data?.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.phone.includes(searchQuery)
      )
    : membersQuery.data

  const createMutation = useMutation({
    mutationFn: memberApi.createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberRequest }) =>
      memberApi.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: memberApi.deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })

  return {
    members: filteredMembers ?? [],
    allMembers: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
    error: membersQuery.error,
    refetch: membersQuery.refetch,
    createMember: (data: CreateMemberRequest) => createMutation.mutateAsync(data),
    updateMember: (id: string, data: UpdateMemberRequest) =>
      updateMutation.mutateAsync({ id, data }),
    deleteMember: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: () => memberApi.getMember(id),
    enabled: !!id,
  })
}
