import api from '../../services/api'
import { SynthesisHistory } from '../../types'

export const galleryApi = {
  getHistory: async (): Promise<SynthesisHistory[]> => {
    const response = await api.get<SynthesisHistory[]>('/synthesis-history')
    return response.data
  },

  getHistoryItem: async (id: string): Promise<SynthesisHistory> => {
    const response = await api.get<SynthesisHistory>(`/synthesis-history/${id}`)
    return response.data
  },

  deleteHistoryItem: async (id: string): Promise<void> => {
    await api.delete(`/synthesis-history/${id}`)
  },
}
