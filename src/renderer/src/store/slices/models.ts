import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Model {
  id: string
  name: string
  provider: string
  maxTokens: number
  contextWindow: number
  enabled: boolean
  nameKey?: string
}

interface ModelsState {
  items: Model[]
  activeId: string | null
}

const defaultModels: Model[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', maxTokens: 4096, contextWindow: 128000, enabled: true, nameKey: 'model.gpt-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', maxTokens: 4096, contextWindow: 128000, enabled: true, nameKey: 'model.gpt-4o-mini' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', maxTokens: 4096, contextWindow: 128000, enabled: true, nameKey: 'model.gpt-4-turbo' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 4096, contextWindow: 16384, enabled: true, nameKey: 'model.gpt-3.5-turbo' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', maxTokens: 8192, contextWindow: 200000, enabled: true, nameKey: 'model.claude-3-5-sonnet-20241022' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', maxTokens: 4096, contextWindow: 200000, enabled: true, nameKey: 'model.claude-3-opus-20240229' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', maxTokens: 4096, contextWindow: 200000, enabled: true, nameKey: 'model.claude-3-haiku-20240307' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', maxTokens: 8192, contextWindow: 1000000, enabled: true, nameKey: 'model.gemini-1.5-pro' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', maxTokens: 8192, contextWindow: 1000000, enabled: true, nameKey: 'model.gemini-1.5-flash' },
]

const initialState: ModelsState = {
  items: defaultModels,
  activeId: 'gpt-4o',
}

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setModels: (state, action: PayloadAction<Model[]>) => {
      state.items = action.payload
    },
    addModel: (state, action: PayloadAction<Model>) => {
      state.items.push(action.payload)
    },
    updateModel: (state, action: PayloadAction<Model>) => {
      const index = state.items.findIndex((m) => m.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteModel: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((m) => m.id !== action.payload)
      if (state.activeId === action.payload) {
        state.activeId = state.items[0]?.id || null
      }
    },
    setActiveModel: (state, action: PayloadAction<string>) => {
      state.activeId = action.payload
    },
  },
})

export const { setModels, addModel, updateModel, deleteModel, setActiveModel } = modelsSlice.actions

export default modelsSlice.reducer
