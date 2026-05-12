import { createJSONStorage, type StateStorage } from 'zustand/middleware'

type WebStorageName = 'localStorage' | 'sessionStorage'

function createMemoryStorage(): StateStorage {
  const data = new Map<string, string>()

  return {
    getItem: (name) => data.get(name) ?? null,
    setItem: (name, value) => {
      data.set(name, value)
    },
    removeItem: (name) => {
      data.delete(name)
    },
  }
}

function getWebStorage(name: WebStorageName): StateStorage {
  if (typeof window === 'undefined') return createMemoryStorage()

  try {
    return window[name]
  } catch {
    return createMemoryStorage()
  }
}

export const localPersistStorage = createJSONStorage(() => getWebStorage('localStorage'))
export const sessionPersistStorage = createJSONStorage(() => getWebStorage('sessionStorage'))
