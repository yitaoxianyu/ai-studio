import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

export type AssistantIcon = 'bot' | 'code' | 'writer' | 'translator' | 'sparkles'

export interface Assistant {
  id: string
  name: string
  description: string
  systemPrompt: string
  model?: string
  avatar?: string
  icon?: AssistantIcon
  nameKey?: string
  descriptionKey?: string
  systemPromptKey?: string
  createdAt: number
}

interface AssistantsState {
  items: Assistant[]
  activeId: string | null
}

const defaultAssistants: Assistant[] = [
  {
    id: 'default',
    name: 'General Assistant',
    description: 'A helpful AI assistant for general tasks',
    systemPrompt: 'You are a helpful AI assistant.',
    icon: 'sparkles',
    nameKey: 'assistant.default.name',
    descriptionKey: 'assistant.default.description',
    systemPromptKey: 'assistant.default.systemPrompt',
    createdAt: Date.now(),
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Expert in programming and software development',
    systemPrompt: 'You are an expert programmer. Help users with coding questions, debugging, and software development best practices.',
    icon: 'code',
    nameKey: 'assistant.code.name',
    descriptionKey: 'assistant.code.description',
    systemPromptKey: 'assistant.code.systemPrompt',
    createdAt: Date.now(),
  },
  {
    id: 'writer',
    name: 'Content Writer',
    description: 'Professional writing assistant',
    systemPrompt: 'You are a professional writer. Help users create engaging content, improve their writing, and provide editorial feedback.',
    icon: 'writer',
    nameKey: 'assistant.writer.name',
    descriptionKey: 'assistant.writer.description',
    systemPromptKey: 'assistant.writer.systemPrompt',
    createdAt: Date.now(),
  },
  {
    id: 'translator',
    name: 'Translator',
    description: 'Professional translation assistant',
    systemPrompt: 'You are a professional translator. Help users translate text between different languages accurately and naturally.',
    icon: 'translator',
    nameKey: 'assistant.translator.name',
    descriptionKey: 'assistant.translator.description',
    systemPromptKey: 'assistant.translator.systemPrompt',
    createdAt: Date.now(),
  },
]

const initialState: AssistantsState = {
  items: defaultAssistants,
  activeId: 'default',
}

const assistantsSlice = createSlice({
  name: 'assistants',
  initialState,
  reducers: {
    addAssistant: (state, action: PayloadAction<Omit<Assistant, 'id' | 'createdAt'>>) => {
      const assistant: Assistant = {
        ...action.payload,
        id: uuidv4(),
        createdAt: Date.now(),
      }
      state.items.push(assistant)
    },
    updateAssistant: (state, action: PayloadAction<Assistant>) => {
      const index = state.items.findIndex((a) => a.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteAssistant: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((a) => a.id !== action.payload)
      if (state.activeId === action.payload) {
        state.activeId = state.items[0]?.id || null
      }
    },
    setActiveAssistant: (state, action: PayloadAction<string>) => {
      state.activeId = action.payload
    },
  },
})

export const { addAssistant, updateAssistant, deleteAssistant, setActiveAssistant } = assistantsSlice.actions

export default assistantsSlice.reducer
