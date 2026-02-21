import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector, useAppDispatch } from '../hooks/useRedux'
import { addMessage, updateMessage, addConversation, deleteMessage } from '../store/slices/conversations'
import { Send, Loader2, Bot, User, Sparkles, ArrowUp, Code, PenTool, Languages, Paperclip, Mic, Image } from 'lucide-react'
import ChatService from '../services/ChatService'
import MessageContent from '../components/Chat/MessageContent'
import ModelSelector from '../components/Chat/ModelSelector'
import ThinkingEffect from '../components/Chat/ThinkingEffect'
import MessageActions from '../components/Chat/MessageActions'
import { AssistantIcon } from '../store/slices/assistants'

const assistantIconMap: Record<AssistantIcon, React.FC<{ className?: string }>> = {
  bot: Bot,
  code: Code,
  writer: PenTool,
  translator: Languages,
  sparkles: Sparkles,
}

const HomePage: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const conversations = useAppSelector((state) => state.conversations.items)
  const activeConversationId = useAppSelector((state) => state.conversations.activeId)
  const assistants = useAppSelector((state) => state.assistants.items)
  const activeAssistantId = useAppSelector((state) => state.assistants.activeId)
  const models = useAppSelector((state) => state.models.items)
  const activeModelId = useAppSelector((state) => state.models.activeId)
  const settings = useAppSelector((state) => state.settings)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const activeConversation = conversations.find((c) => c.id === activeConversationId)
  const activeAssistant = assistants.find((a) => a.id === activeAssistantId)
  const activeModel = models.find((m) => m.id === activeModelId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages, streamingContent])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)
    setStreamingContent('')

    const newConversationId = activeConversationId || Date.now().toString()
    
    if (!activeConversationId) {
      dispatch(addConversation({ title: userMessage.slice(0, 30) }))
    }

    dispatch(
      addMessage({
        conversationId: newConversationId,
        message: {
          role: 'user',
          content: userMessage,
          model: activeModel?.name,
        },
      })
    )

    try {
      const provider = settings.providers.find((p) => p.id === activeModel?.provider)
      const systemPrompt = activeAssistant?.systemPromptKey 
        ? t(activeAssistant.systemPromptKey) 
        : (activeAssistant?.systemPrompt || t('assistant.default.systemPrompt'))

      let assistantMessageId = ''
      
      const onStream = (content: string) => {
        setStreamingContent(content)
        if (!assistantMessageId) {
          dispatch(
            addMessage({
              conversationId: newConversationId,
              message: {
                role: 'assistant',
                content: content,
                model: activeModel?.name,
                provider: activeModel?.provider,
              },
            })
          )
          assistantMessageId = Date.now().toString()
        } else {
          dispatch(
            updateMessage({
              conversationId: newConversationId,
              messageId: assistantMessageId,
              content: content,
            })
          )
        }
      }

      await ChatService.sendMessage({
        provider: provider?.id || 'openai',
        apiKey: provider?.apiKey || '',
        baseUrl: provider?.baseUrl,
        model: activeModel?.id || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(activeConversation?.messages || []).map((m) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
          })),
          { role: 'user', content: userMessage },
        ],
        stream: settings.streamResponse,
        onStream,
      })
    } catch (error) {
      console.error('Error sending message:', error)
      dispatch(
        addMessage({
          conversationId: newConversationId,
          message: {
            role: 'assistant',
            content: `${t('chat.errorPrefix')}${error instanceof Error ? error.message : t('chat.fetchError')}`,
          },
        })
      )
    } finally {
      setIsLoading(false)
      setStreamingContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content)
  }

  const handleRegenerate = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return
    const lastUserMessage = [...activeConversation.messages].reverse().find((m) => m.role === 'user')
    if (lastUserMessage) {
      setInput(lastUserMessage.content)
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    if (activeConversationId) {
      dispatch(deleteMessage({ conversationId: activeConversationId, messageId }))
    }
  }

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
        <div className="text-center max-w-2xl px-6 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {t('common.welcome')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg leading-relaxed">
            {t('chat.welcomeHint')}
          </p>
          
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {assistants.slice(0, 4).map((assistant) => {
              const IconComponent = assistant.icon ? assistantIconMap[assistant.icon] : Bot
              return (
                <button
                  key={assistant.id}
                  onClick={() => {
                    dispatch(addConversation({ assistantId: assistant.id }))
                  }}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white text-sm">
                      {assistant.nameKey ? t(assistant.nameKey) : assistant.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                      {assistant.descriptionKey ? t(assistant.descriptionKey) : assistant.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {activeConversation.messages.map((message, index) => {
              const AssistantIconComponent = activeAssistant?.icon ? assistantIconMap[activeAssistant.icon] : Bot
              return (
                <div
                  key={message.id}
                  className={`group flex gap-4 animate-fade-in ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <AssistantIconComponent className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <MessageContent content={message.content} />
                    </div>
                    <div className={`mt-1 ${message.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                      <MessageActions
                        isUser={message.role === 'user'}
                        onCopy={() => handleCopyMessage(message.content)}
                        onRegenerate={message.role === 'assistant' ? handleRegenerate : undefined}
                        onDelete={() => handleDeleteMessage(message.id)}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {isLoading && streamingContent === '' && (
              <div className="flex gap-4 animate-fade-in">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-sm">
                    {activeAssistant?.icon ? (
                      React.createElement(assistantIconMap[activeAssistant.icon], { className: 'w-5 h-5 text-white' })
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-block bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <ThinkingEffect />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3 px-1">
            <ModelSelector />
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t('chat.assistant')}:
              </span>
              <span className="text-xs font-semibold text-primary">
                {activeAssistant?.nameKey ? t(activeAssistant.nameKey) : (activeAssistant?.name || t('chat.defaultAssistant'))}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chat.inputPlaceholder')}
                  className="w-full resize-none border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 pr-24 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200"
                  rows={1}
                  disabled={isLoading}
                  style={{ minHeight: '52px', maxHeight: '200px' }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={t('chat.attachFile') || 'Attach file'}
                  >
                    <Paperclip className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={t('chat.image') || 'Image'}
                  >
                    <Image className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {t('chat.sendHint') || 'Press Enter to send, Shift+Enter for new line'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
