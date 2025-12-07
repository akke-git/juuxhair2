import api from '../../services/api'
import { Member, CreateMemberRequest, UpdateMemberRequest } from '../../types'

export const memberApi = {
  getMembers: async (): Promise<Member[]> => {
    const response = await api.get<Member[]>('/members')
    return response.data
  },

  getMember: async (id: string): Promise<Member> => {
    const response = await api.get<Member>(`/members/${id}`)
    return response.data
  },

  createMember: async (data: CreateMemberRequest): Promise<Member> => {
    const response = await api.post<Member>('/members', data)
    return response.data
  },

  updateMember: async (id: string, data: UpdateMemberRequest): Promise<Member> => {
    const response = await api.put<Member>(`/members/${id}`, data)
    return response.data
  },

  deleteMember: async (id: string): Promise<void> => {
    await api.delete(`/members/${id}`)
  },

  uploadMemberPhoto: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<{ path: string }>('/upload/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.path
  },
}
