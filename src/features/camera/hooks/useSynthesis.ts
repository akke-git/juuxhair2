import { useMutation, useQuery } from '@tanstack/react-query'
import { synthesisApi } from '../api'
import { useCameraStore } from '../store/cameraStore'

export function useStyles() {
  return useQuery({
    queryKey: ['styles'],
    queryFn: synthesisApi.getStyles,
  })
}

export function useSynthesis() {
  const { setResultImage, setIsProcessing } = useCameraStore()

  return useMutation({
    mutationFn: async ({ image, styleId }: { image: File; styleId: string }) => {
      setIsProcessing(true)
      const result = await synthesisApi.synthesize(image, styleId)
      return result
    },
    onSuccess: (resultImage) => {
      setResultImage(resultImage)
      setIsProcessing(false)
    },
    onError: () => {
      setIsProcessing(false)
    },
  })
}

export function useSaveResult() {
  return useMutation({
    mutationFn: async ({
      memberId,
      originalPath,
      styleId,
      resultImage,
    }: {
      memberId?: string
      originalPath: string
      styleId: string
      resultImage: string
    }) => {
      // First upload the result image
      const resultPath = await synthesisApi.uploadResultPhoto(resultImage)

      // Handle original image path
      let finalOriginalPath = originalPath

      // If original is a base64 string (new photo/camera), upload it
      if (originalPath.startsWith('data:')) {
        finalOriginalPath = await synthesisApi.uploadOriginalPhoto(originalPath)
      }
      // If original is a full URL (member photo), try to extract relative path
      else if (originalPath.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
        if (originalPath.includes(baseUrl)) {
          let relative = originalPath.replace(baseUrl, '')
          if (relative.startsWith('/images/')) {
            relative = relative.replace('/images/', '')
          }
          if (relative.startsWith('/')) {
            relative = relative.substring(1)
          }
          finalOriginalPath = relative
        }
      }

      // Then save the history
      return synthesisApi.saveHistory({
        member_id: memberId,
        original_photo_path: finalOriginalPath,
        reference_style_id: styleId,
        result_photo_path: resultPath,
      })
    },
  })
}
