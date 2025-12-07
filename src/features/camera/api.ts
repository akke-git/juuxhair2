import api from '../../services/api'
import { Style, SynthesisHistory } from '../../types'

const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',')
  const data = arr.length > 1 ? arr[1] : arr[0]
  const mime = arr.length > 1 ? (arr[0].match(/:(.*?);/)?.[1] || 'image/png') : 'image/png'
  
  const bstr = atob(data)
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export const synthesisApi = {
  getStyles: async (): Promise<Style[]> => {
    const response = await api.get<{ styles: any[] }>('/styles')
    return response.data.styles.map((style) => ({
      id: style.id,
      image_url: `/images/${style.image_path}`,
      name: style.name,
    }))
  },

  synthesize: async (userImage: File, styleId: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', userImage)
    formData.append('style_id', styleId)

    const response = await api.post<{ result_image: string }>('/synthesize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for AI processing
    })
    
    if (!response.data.result_image) {
      throw new Error('No result image returned from server')
    }

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

  uploadOriginalPhoto: async (base64Image: string): Promise<string> => {
    const file = base64ToFile(base64Image, 'original.jpg')
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<{ photo_path: string }>('/upload/original-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.photo_path
  },

  uploadResultPhoto: async (base64Image: string): Promise<string> => {
    const file = base64ToFile(base64Image, 'result.png')
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<{ photo_path: string }>('/upload/result-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.photo_path
  },
}