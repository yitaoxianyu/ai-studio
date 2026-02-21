import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux'
import { addConversation, setActiveConversation, deleteConversation, renameConversation } from '../../store/slices/conversations'
import { MessageSquare, Plus, Settings, Trash2, Bot, ChevronDown, ChevronRight, Pencil, Sparkles, Code, PenTool, Languages, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AssistantIcon } from '../../store/slices/assistants'
import Modal from '../UI/Modal'

const iconMap: Record<AssistantIcon, React.FC<{ className?: string }>> = {
  bot: Bot,
  code: Code,
  writer: PenTool,
  translator: Languages,
  sparkles: Sparkles,
}

const Sidebar: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const conversations = useAppSelector((state) => state.conversations.items)
  const activeConversationId = useAppSelector((state) => state.conversations.activeId)
  const assistants = useAppSelector((state) => state.assistants.items)
  
  const [conversationsExpanded, setConversationsExpanded] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showAssistantModal, setShowAssistantModal] = useState(false)

  const handleNewConversationClick = () => {
    setShowAssistantModal(true)
  }

  const handleSelectAssistant = (assistantId: string) => {
    dispatch(addConversation({ assistantId }))
    setShowAssistantModal(false)
    navigate('/')
  }

  const handleSelectConversation = (id: string) => {
    dispatch(setActiveConversation(id))
    navigate('/')
  }

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    dispatch(deleteConversation(id))
  }

  const handleOpenSettings = () => {
    navigate('/settings')
  }

  const handleStartRename = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    setEditingId(id)
    setEditingTitle(title)
  }

  const handleFinishRename = (id: string) => {
    if (editingTitle.trim()) {
      dispatch(renameConversation({ id, title: editingTitle.trim() }))
    }
    setEditingId(null)
    setEditingTitle('')
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleFinishRename(id)
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditingTitle('')
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const todayConversations = filteredConversations.filter((c) => {
    const today = new Date()
    const convDate = new Date(c.updatedAt)
    return convDate.toDateString() === today.toDateString()
  })

  const yesterdayConversations = filteredConversations.filter((c) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const convDate = new Date(c.updatedAt)
    return convDate.toDateString() === yesterday.toDateString()
  })

  const olderConversations = filteredConversations.filter((c) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const convDate = new Date(c.updatedAt)
    return convDate < yesterday
  })

  return (
    <>
      <div className="w-72 bg-sidebar-bg dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-800 dark:text-white">{t('common.appName')}</span>
            </div>
          </div>
          <button
            onClick={handleNewConversationClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            {t('sidebar.newChat')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="py-3">
            <div className="flex items-center justify-between px-4 py-2 mx-2">
              <div 
                className="flex items-center gap-2 cursor-pointer flex-1"
                onClick={() => setConversationsExpanded(!conversationsExpanded)}
              >
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('sidebar.conversations')}
                </span>
                {conversationsExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
              {conversations.length > 0 && (
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {showSearch ? (
                    <X className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Search className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              )}
            </div>

            {showSearch && conversationsExpanded && (
              <div className="px-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('sidebar.searchConversations')}
                    className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            )}

            {conversationsExpanded && (
              <div className="mt-1 px-2">
                {conversations.length === 0 ? (
                  <div className="px-3 py-8 text-center">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">{t('sidebar.noConversations')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayConversations.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs text-gray-400 dark:text-gray-500 font-medium">
                          {t('common.today') || '今天'}
                        </div>
                        {todayConversations.map((conversation) => (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isActive={activeConversationId === conversation.id}
                            onSelect={handleSelectConversation}
                            onDelete={handleDeleteConversation}
                            onRename={handleStartRename}
                            editingId={editingId}
                            editingTitle={editingTitle}
                            setEditingTitle={setEditingTitle}
                            handleFinishRename={handleFinishRename}
                            handleKeyDown={handleKeyDown}
                          />
                        ))}
                      </div>
                    )}

                    {yesterdayConversations.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs text-gray-400 dark:text-gray-500 font-medium">
                          {t('common.yesterday') || '昨天'}
                        </div>
                        {yesterdayConversations.map((conversation) => (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isActive={activeConversationId === conversation.id}
                            onSelect={handleSelectConversation}
                            onDelete={handleDeleteConversation}
                            onRename={handleStartRename}
                            editingId={editingId}
                            editingTitle={editingTitle}
                            setEditingTitle={setEditingTitle}
                            handleFinishRename={handleFinishRename}
                            handleKeyDown={handleKeyDown}
                          />
                        ))}
                      </div>
                    )}

                    {olderConversations.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs text-gray-400 dark:text-gray-500 font-medium">
                          {t('common.previous') || '更早'}
                        </div>
                        {olderConversations.map((conversation) => (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isActive={activeConversationId === conversation.id}
                            onSelect={handleSelectConversation}
                            onDelete={handleDeleteConversation}
                            onRename={handleStartRename}
                            editingId={editingId}
                            editingTitle={editingTitle}
                            setEditingTitle={setEditingTitle}
                            handleFinishRename={handleFinishRename}
                            handleKeyDown={handleKeyDown}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">{t('sidebar.settings')}</span>
          </button>
        </div>
      </div>

      <Modal
        isOpen={showAssistantModal}
        onClose={() => setShowAssistantModal(false)}
        title={t('sidebar.selectAssistant')}
        width="w-96"
      >
        <div className="p-2">
          {assistants.map((assistant) => {
            const IconComponent = iconMap[assistant.icon || 'bot']
            const displayName = assistant.nameKey ? t(assistant.nameKey) : assistant.name
            return (
              <button
                key={assistant.id}
                onClick={() => handleSelectAssistant(assistant.id)}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors duration-150"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{displayName}</div>
                  {assistant.descriptionKey && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t(assistant.descriptionKey)}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Modal>
    </>
  )
}

interface ConversationItemProps {
  conversation: { id: string; title: string; updatedAt: number }
  isActive: boolean
  onSelect: (id: string) => void
  onDelete: (e: React.MouseEvent, id: string) => void
  onRename: (e: React.MouseEvent, id: string, title: string) => void
  editingId: string | null
  editingTitle: string
  setEditingTitle: (title: string) => void
  handleFinishRename: (id: string) => void
  handleKeyDown: (e: React.KeyboardEvent, id: string) => void
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
  editingId,
  editingTitle,
  setEditingTitle,
  handleFinishRename,
  handleKeyDown,
}) => {
  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 text-primary'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
      {editingId === conversation.id ? (
        <input
          type="text"
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onBlur={() => handleFinishRename(conversation.id)}
          onKeyDown={(e) => handleKeyDown(e, conversation.id)}
          className="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 dark:text-gray-300"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate text-sm">{conversation.title}</span>
      )}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => onRename(e, conversation.id, conversation.title)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <Pencil className="w-3 h-3 text-gray-400" />
        </button>
        <button
          onClick={(e) => onDelete(e, conversation.id)}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
        >
          <Trash2 className="w-3 h-3 text-red-400" />
        </button>
      </div>
    </div>
  )
}

export default Sidebar
