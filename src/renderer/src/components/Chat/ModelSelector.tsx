import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux'
import { setActiveModel } from '../../store/slices/models'
import { Check, Cpu, Zap, Brain, Sparkles } from 'lucide-react'
import Modal from '../UI/Modal'

const providerIcons: Record<string, React.FC<{ className?: string }>> = {
  openai: Sparkles,
  anthropic: Brain,
  google: Zap,
  groq: Zap,
  deepseek: Brain,
  ollama: Cpu,
  default: Cpu,
}

const ModelSelector: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const models = useAppSelector((state) => state.models.items)
  const activeModelId = useAppSelector((state) => state.models.activeId)
  
  const [isOpen, setIsOpen] = useState(false)
  
  const activeModel = models.find((m) => m.id === activeModelId)
  
  const providerNames: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google AI',
    openrouter: 'OpenRouter',
    groq: t('provider.groq'),
    deepseek: t('provider.deepseek'),
    ollama: t('provider.ollama'),
    custom: t('provider.custom'),
  }
  
  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = []
    acc[model.provider].push(model)
    return acc
  }, {} as Record<string, typeof models>)
  
  const handleSelectModel = (modelId: string) => {
    dispatch(setActiveModel(modelId))
    setIsOpen(false)
  }
  
  const ProviderIcon = activeModel ? (providerIcons[activeModel.provider] || Cpu) : Cpu

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
      >
        <ProviderIcon className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {activeModel?.nameKey ? t(activeModel.nameKey) : (activeModel?.name || t('chat.notSelected'))}
        </span>
      </button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('sidebar.selectModel')}
        width="w-96"
      >
        <div className="p-2">
          {Object.entries(groupedModels).map(([provider, providerModels]) => {
            const ProviderIconComponent = providerIcons[provider] || Cpu
            return (
              <div key={provider} className="mb-2 last:mb-0">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <ProviderIconComponent className="w-3.5 h-3.5" />
                  {providerNames[provider] || provider}
                </div>
                {providerModels.map((model) => {
                  const isSelected = activeModelId === model.id
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleSelectModel(model.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-150 ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {model.nameKey ? t(model.nameKey) : model.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.floor(model.contextWindow / 1000)}{t('settings.models.contextWindow')}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
          
          {Object.keys(groupedModels).length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('common.noResults')}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default ModelSelector
