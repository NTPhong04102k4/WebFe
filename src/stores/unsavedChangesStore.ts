import { create } from 'zustand'

interface UnsavedChangesState {
  isDirty: boolean
  message: string
  setDirty: (isDirty: boolean, message?: string) => void
}

export const useUnsavedChangesStore = create<UnsavedChangesState>((set) => ({
  isDirty: false,
  message: 'Bạn có thay đổi chưa lưu. Nếu rời khỏi trang, dữ liệu sẽ bị mất.',
  setDirty: (isDirty, message) =>
    set((state) => ({
      isDirty,
      message: message ?? state.message,
    })),
}))
