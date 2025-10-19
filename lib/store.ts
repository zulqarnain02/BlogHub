import { create } from "zustand"

type BlogStore = {
  selectedCategories: number[]
  toggleCategory: (categoryId: number) => void
  setSelectedCategories: (categoryIds: number[]) => void
}

export const useBlogStore = create<BlogStore>((set) => ({
  selectedCategories: [],
  toggleCategory: (categoryId) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(categoryId)
        ? state.selectedCategories.filter((id) => id !== categoryId)
        : [...state.selectedCategories, categoryId],
    })),
  setSelectedCategories: (categoryIds) =>
    set({ selectedCategories: categoryIds }),
}))
