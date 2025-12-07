import api from '../../services/api'
import { Style, SynthesisHistory } from '../../types'

export const synthesisApi = {
  getStyles: async (): Promise<Style[]> => {
    const response = await api.get<Style[]>('/styles')
    return response.data
  },

  synthesize: async (userImage: File, styleId: string): Promise<string> => {
    const formData = new FormData()
    formData.append('user_image', userImage)
    formData.append('style_id', styleId)

    const response = await api.post<{ result_image: string }>('/synthesize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for AI processing
    })
    return response.data.result_image // base64 encoded
  },

  getHistory: async (): Promise<SynthesisHistory[]> => {
    const response = await api.get<SynthesisHistory[]>('/synthesis-history')
    return response.data
  },

  saveHistory: async (data: {
    member_id?: string
    original_photo_path: string
    reference_style_id: string
    result_photo_path: string
  }): Promise<SynthesisHistory> => {
    const response = await api.post<SynthesisHistory>('/synthesis-history', data)
    return response.data
  },

  uploadResultPhoto: async (base64Image: string): Promise<string> => {
    const response = await api.post<{ path: string }>('/upload/result-photo', {
      image: base64Image,
    })
    return response.data.path
  },
}
