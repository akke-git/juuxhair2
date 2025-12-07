import { create } from 'zustand'
import { Member, Style } from '../../../types'

interface CameraState {
  selectedMember: Member | null
  selectedImage: File | null
  selectedImagePreview: string | null
  selectedStyle: Style | null
  resultImage: string | null
  isProcessing: boolean
  setSelectedMember: (member: Member | null) => void
  setSelectedImage: (file: File | null, preview: string | null) => void
  setSelectedStyle: (style: Style | null) => void
  setResultImage: (image: string | null) => void
  setIsProcessing: (value: boolean) => void
  reset: () => void
}

export const useCameraStore = create<CameraState>((set) => ({
  selectedMember: null,
  selectedImage: null,
  selectedImagePreview: null,
  selectedStyle: null,
  resultImage: null,
  isProcessing: false,

  setSelectedMember: (member) => set({ selectedMember: member }),

  setSelectedImage: (file, preview) =>
    set({ selectedImage: file, selectedImagePreview: preview }),

  setSelectedStyle: (style) => set({ selectedStyle: style }),

  setResultImage: (image) => set({ resultImage: image }),

  setIsProcessing: (value) => set({ isProcessing: value }),

  reset: () =>
    set({
      selectedMember: null,
      selectedImage: null,
      selectedImagePreview: null,
      selectedStyle: null,
      resultImage: null,
      isProcessing: false,
    }),
}))
