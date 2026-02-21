const isElectron = typeof window !== 'undefined' && window.api && window.api.getStore

const electronStoreStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isElectron) {
        const value = await window.api.getStore(key)
        return value ? JSON.stringify(value) : null
      }
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Failed to get item from storage:', error)
      return null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isElectron) {
        await window.api.setStore(key, JSON.parse(value))
      } else {
        localStorage.setItem(key, value)
      }
    } catch (error) {
      console.error('Failed to set item to storage:', error)
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (isElectron) {
        await window.api.deleteStore(key)
      } else {
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error('Failed to remove item from storage:', error)
    }
  },
}

export default electronStoreStorage
