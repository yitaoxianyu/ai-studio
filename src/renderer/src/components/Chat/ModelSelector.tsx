import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux'
import { setActiveModel } from '../../store/slices/models'
import { ChevronDown, Check, Search, Cpu, Zap, Brain, Sparkles } from 'lucide-react'

const providerIcons: Record<string, React.FC<{ className?: string }>> = {
  openai: Sparkles,
  anthropic: Brain,
  google: Zap,
  default: Cpu,
}

const ModelSelector: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const models = useAppSelector((state) => state.models.items)
  const activeModelId = useAppSelector((state) => state.models.activeId)
  const settings = useAppSelector((state) => state.settings)
  
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const activeModel = models.find((m) => m.id === activeModelId)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
    if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])
  
  const providerNames: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google AI',
    openrouter: 'OpenRouter',
    ollama: t('provider.ollama'),
    custom: t('provider.custom'),
  }
  
  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = []
    acc[model.provider].push(model)
    return acc
  }, {} as Record<string, typeof models>)
  
  const filteredGroups = Object.entries(groupedModels).reduce((acc, [provider, providerModels]) => {
    const filtered = providerModels.filter((model) => {
      const name = model.nameKey ? t(model.nameKey) : model.name
      return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             model.id.toLowerCase().includes(searchQuery.toLowerCase())
    })
    if (filtered.length > 0) {
      acc[provider] = filtered
    }
    return acc
  }, {} as Record<string, typeof models>)
  
  const handleSelectModel = (modelId: string) => {
    dispatch(setActiveModel(modelId))
    setIsOpen(false)
  }
  
  const ProviderIcon = activeModel ? (providerIcons[activeModel.provider] || Cpu) : Cpu
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
      >
        <ProviderIcon className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {activeModel?.nameKey ? t(activeModel.nameKey) : (activeModel?.name || t('chat.notSelected'))}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fade-in overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {Object.entries(filteredGroups).map(([provider, providerModels]) => {
              const ProviderIconComponent = providerIcons[provider] || Cpu
              return (
                <div key={provider}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50 flex items-center gap-2">
                    <ProviderIconComponent className="w-3.5 h-3.5" />
                    {providerNames[provider] || provider}
                  </div>
                  {providerModels.map((model) => {
                    const isSelected = activeModelId === model.id
                    return (
                      <button
                        key={model.id}
                        onClick={() => handleSelectModel(model.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {model.nameKey ? t(model.nameKey) : model.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.floor(model.contextWindow / 1000)}{t('settings.models.contextWindow')}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
            
            {Object.keys(filteredGroups).length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {t('common.noResults')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelSelector
