import api from '../../services/api'
import { Style } from '../../types'

export const adminApi = {
  getStyles: async (): Promise<Style[]> => {
    const response = await api.get<{ styles: any[] }>('/styles')
    return response.data.styles.map((style) => ({
      id: style.id,
      // Backend returns "styles/filename.jpg" (assets/ stripped)
      // Route is /images/styles/filename.jpg
      image_url: `/images/${style.image_path}`,
      name: style.name,
    }))
  },

  uploadStyle: async (file: File, name?: string): Promise<Style> => {
    const formData = new FormData()
    formData.append('file', file)
    if (name) {
      formData.append('name', name)
    }
    const response = await api.post<any>('/styles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    // Backend returns "assets/styles/filename.jpg"
    // We need "/images/styles/filename.jpg"
    const imagePath = response.data.file_path.replace('assets/', '')
    
    return {
      id: response.data.style_id,
      image_url: `/images/${imagePath}`,
      name: name,
    }
  },

  deleteStyle: async (id: string): Promise<void> => {
    await api.delete(`/styles/${id}`)
  },
}
