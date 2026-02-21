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

export interface Assistant {
  id: string
  name: string
  description: string
  systemPrompt: string
  model?: string
  avatar?: string
  createdAt: number
}

export interface Model {
  id: string
  name: string
  provider: string
  maxTokens: number
  contextWindow: number
  enabled: boolean
}

export interface Provider {
  id: string
  name: string
  apiKey: string
  baseUrl?: string
  enabled: boolean
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  providers: Provider[]
  defaultModel: string
  streamResponse: boolean
  sendShortcut: 'Enter' | 'Cmd+Enter'
}
