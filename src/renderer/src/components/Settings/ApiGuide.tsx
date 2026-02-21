import React from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Key, Zap, Globe, Server } from 'lucide-react'

const API_GUIDE_LINKS: Record<string, { url: string; icon: React.FC<{ className?: string }>; free: boolean; nameKey: string }> = {
  google: { url: 'https://aistudio.google.com/app/apikey', icon: Zap, free: true, nameKey: 'provider.google' },
  groq: { url: 'https://console.groq.com/keys', icon: Zap, free: true, nameKey: 'provider.groq' },
  deepseek: { url: 'https://platform.deepseek.com/api_keys', icon: Globe, free: false, nameKey: 'provider.deepseek' },
  openai: { url: 'https://platform.openai.com/api-keys', icon: Key, free: false, nameKey: 'provider.openai' },
  anthropic: { url: 'https://console.anthropic.com/settings/keys', icon: Key, free: false, nameKey: 'provider.anthropic' },
  ollama: { url: 'https://ollama.ai', icon: Server, free: true, nameKey: 'provider.ollama' },
}

const ApiGuide: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
        <Key className="w-4 h-4 text-primary" />
        {t('settings.providers.guide.title')}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(API_GUIDE_LINKS).map(([provider, info]) => {
          const IconComponent = info.icon
          return (
            <a
              key={provider}
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 p-2.5 rounded-lg transition-all duration-200 ${
                info.free
                  ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${info.free ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {t(info.nameKey)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {info.free ? t('common.free') : t('common.paid')}
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        {t('settings.providers.guide.google')}
      </p>
    </div>
  )
}

export default ApiGuide
