import api from '../../services/api'
import { Style, StyleUpdate } from '../../types'

export const adminApi = {
  getStyles: async (): Promise<Style[]> => {
    const response = await api.get<{ styles: any[] }>('/styles')
    return response.data.styles.map((style) => ({
      id: style.id,
      // Backend returns "styles/filename.jpg" (assets/ stripped)
      // Route is /images/styles/filename.jpg
      image_url: `/images/${style.image_path}`,
      image_path: style.image_path,
      name: style.name,
      tags: style.tags,
      gender: style.gender,
      category: style.category,
    }))
  },

  uploadStyle: async (
    file: File, 
    name?: string, 
    tags: string[] = [], 
    gender: string = 'neutral', 
    category: string = 'unknown'
  ): Promise<Style> => {
    const formData = new FormData()
    formData.append('file', file)
    // Send name as 'name' field, do NOT send as 'style_id'
    // Backend will auto-generate 'style_id' and save 'name' in metadata
    if (name) {
      formData.append('name', name)
    }
    formData.append('tags', JSON.stringify(tags))
    formData.append('gender', gender)
    formData.append('category', category)

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
      tags: tags,
      gender: gender,
      category: category
    }
  },

  updateStyle: async (id: string, data: StyleUpdate): Promise<void> => {
    await api.put(`/styles/${id}`, data)
  },

  deleteStyle: async (id: string): Promise<void> => {
    await api.delete(`/styles/${id}`)
  },
}
