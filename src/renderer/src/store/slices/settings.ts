import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Provider {
  id: string
  name: string
  apiKey: string
  baseUrl?: string
  enabled: boolean
}

interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  language: string
  providers: Provider[]
  defaultModel: string
  streamResponse: boolean
  sendShortcut: 'Enter' | 'Cmd+Enter'
}

const initialState: SettingsState = {
  theme: 'system',
  language: 'zh-CN',
  providers: [],
  defaultModel: 'gpt-4o',
  streamResponse: true,
  sendShortcut: 'Enter',
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    addProvider: (state, action: PayloadAction<Provider>) => {
      state.providers.push(action.payload)
    },
    updateProvider: (state, action: PayloadAction<Provider>) => {
      const index = state.providers.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.providers[index] = action.payload
      }
    },
    deleteProvider: (state, action: PayloadAction<string>) => {
      state.providers = state.providers.filter((p) => p.id !== action.payload)
    },
    setDefaultModel: (state, action: PayloadAction<string>) => {
      state.defaultModel = action.payload
    },
    setStreamResponse: (state, action: PayloadAction<boolean>) => {
      state.streamResponse = action.payload
    },
    setSendShortcut: (state, action: PayloadAction<'Enter' | 'Cmd+Enter'>) => {
      state.sendShortcut = action.payload
    },
  },
})

export const {
  setTheme,
  setLanguage,
  addProvider,
  updateProvider,
  deleteProvider,
  setDefaultModel,
  setStreamResponse,
  setSendShortcut,
} = settingsSlice.actions

export default settingsSlice.reducer
