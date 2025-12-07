import api from '../../services/api'
import { SynthesisHistory } from '../../types'

const normalizePath = (path?: string) => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  if (path.startsWith('/images/')) return path
  return `/images/${path}`
}

export const galleryApi = {
  getHistory: async (): Promise<SynthesisHistory[]> => {
    const response = await api.get<SynthesisHistory[]>('/synthesis-history')
    return response.data.map((item) => ({
      ...item,
      result_photo_path: normalizePath(item.result_photo_path),
      original_photo_path: normalizePath(item.original_photo_path),
    }))
  },

  getHistoryItem: async (id: string): Promise<SynthesisHistory> => {
    const response = await api.get<SynthesisHistory>(`/synthesis-history/${id}`)
    return {
      ...response.data,
      result_photo_path: normalizePath(response.data.result_photo_path),
      original_photo_path: normalizePath(response.data.original_photo_path),
    }
  },

  deleteHistoryItem: async (id: string): Promise<void> => {
    await api.delete(`/synthesis-history/${id}`)
  },
}
