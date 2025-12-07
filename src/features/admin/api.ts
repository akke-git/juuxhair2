import api from '../../services/api'
import { Style } from '../../types'

export const adminApi = {
  getStyles: async (): Promise<Style[]> => {
    const response = await api.get<Style[]>('/styles')
    return response.data
  },

  uploadStyle: async (file: File, name?: string): Promise<Style> => {
    const formData = new FormData()
    formData.append('file', file)
    if (name) {
      formData.append('name', name)
    }
    const response = await api.post<Style>('/styles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteStyle: async (id: string): Promise<void> => {
    await api.delete(`/styles/${id}`)
  },
}
