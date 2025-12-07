import { create } from 'zustand'

interface UiState {
  tabIndex: number
  setTabIndex: (index: number) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  isLoading: boolean
  setIsLoading: (value: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  tabIndex: 0,
  setTabIndex: (index) => set({ tabIndex: index }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),
}))
