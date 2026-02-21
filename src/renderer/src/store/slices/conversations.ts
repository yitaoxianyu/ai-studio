import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  model?: string
  provider?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  assistantId?: string
  modelId?: string
}

interface ConversationsState {
  items: Conversation[]
  activeId: string | null
}

const initialState: ConversationsState = {
  items: [],
  activeId: null,
}

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    addConversation: (state, action: PayloadAction<{ title?: string; assistantId?: string; modelId?: string }>) => {
      const conversation: Conversation = {
        id: uuidv4(),
        title: action.payload.title || 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        assistantId: action.payload.assistantId,
        modelId: action.payload.modelId,
      }
      state.items.unshift(conversation)
      state.activeId = conversation.id
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((c) => c.id !== action.payload)
      if (state.activeId === action.payload) {
        state.activeId = state.items[0]?.id || null
      }
    },
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeId = action.payload
    },
    addMessage: (state, action: PayloadAction<{ conversationId: string; message: Omit<Message, 'id' | 'timestamp'> }>) => {
      const conversation = state.items.find((c) => c.id === action.payload.conversationId)
      if (conversation) {
        const message: Message = {
          ...action.payload.message,
          id: uuidv4(),
          timestamp: Date.now(),
        }
        conversation.messages.push(message)
        conversation.updatedAt = Date.now()
      }
    },
    updateMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string; content: string }>) => {
      const conversation = state.items.find((c) => c.id === action.payload.conversationId)
      if (conversation) {
        const message = conversation.messages.find((m) => m.id === action.payload.messageId)
        if (message) {
          message.content = action.payload.content
        }
      }
    },
    deleteMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string }>) => {
      const conversation = state.items.find((c) => c.id === action.payload.conversationId)
      if (conversation) {
        conversation.messages = conversation.messages.filter((m) => m.id !== action.payload.messageId)
        conversation.updatedAt = Date.now()
      }
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      const conversation = state.items.find((c) => c.id === action.payload)
      if (conversation) {
        conversation.messages = []
        conversation.updatedAt = Date.now()
      }
    },
    renameConversation: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const conversation = state.items.find((c) => c.id === action.payload.id)
      if (conversation) {
        conversation.title = action.payload.title
        conversation.updatedAt = Date.now()
      }
    },
  },
})

export const {
  addConversation,
  deleteConversation,
  setActiveConversation,
  addMessage,
  updateMessage,
  deleteMessage,
  clearMessages,
  renameConversation,
} = conversationsSlice.actions

export default conversationsSlice.reducer
