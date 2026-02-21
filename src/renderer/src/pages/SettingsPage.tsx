import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector, useAppDispatch } from '../hooks/useRedux'
import { addProvider, updateProvider, deleteProvider, setTheme, setLanguage } from '../store/slices/settings'
import { setActiveModel } from '../store/slices/models'
import { Save, Trash2, Plus, Eye, EyeOff, Check, ArrowLeft, Sun, Moon, Monitor, Globe, Zap, Server, Cpu } from 'lucide-react'
import { Provider } from '../store/slices/settings'
import { useNavigate } from 'react-router-dom'

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const settings = useAppSelector((state) => state.settings)
  const models = useAppSelector((state) => state.models.items)
  const [activeTab, setActiveTab] = useState<'providers' | 'models' | 'general'>('providers')
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)

  const handleAddProvider = () => {
    setEditingProvider({
      id: Date.now().toString(),
      name: '',
      apiKey: '',
      baseUrl: '',
      enabled: true,
    })
  }

  const handleSaveProvider = () => {
    if (!editingProvider) return
    if (editingProvider.name && editingProvider.apiKey) {
      const existing = settings.providers.find((p) => p.id === editingProvider.id)
      if (existing) {
        dispatch(updateProvider(editingProvider))
      } else {
        dispatch(addProvider(editingProvider))
      }
      setEditingProvider(null)
    }
  }

  const handleDeleteProvider = (id: string) => {
    dispatch(deleteProvider(id))
  }

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(theme))
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    dispatch(setLanguage(lang))
    localStorage.setItem('language', lang)
  }

  const providerNames: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google AI',
    openrouter: 'OpenRouter',
    ollama: t('provider.ollama'),
    custom: t('provider.custom'),
  }

  const tabs = [
    { id: 'providers', label: t('settings.providers.title'), icon: Server },
    { id: 'models', label: t('settings.models.title'), icon: Cpu },
    { id: 'general', label: t('settings.general.title'), icon: Globe },
  ] as const

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('settings.title')}</h1>
          </div>
          <div className="flex gap-1 px-4 pb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-primary shadow-soft'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {activeTab === 'providers' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('settings.providers.title')}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.providers.description')}</p>
                </div>
                <button
                  onClick={handleAddProvider}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  {t('settings.providers.add')}
                </button>
              </div>

              {editingProvider && (
                <div className="card p-5 space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('settings.providers.providerName')}
                    </label>
                    <select
                      value={editingProvider.name}
                      onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                      className="input-field"
                    >
                      <option value="">{t('settings.providers.selectProvider')}</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google AI</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="ollama">{t('provider.ollama')}</option>
                      <option value="custom">{t('provider.custom')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('settings.providers.apiKey')}
                    </label>
                    <input
                      type="password"
                      value={editingProvider.apiKey}
                      onChange={(e) => setEditingProvider({ ...editingProvider, apiKey: e.target.value })}
                      className="input-field"
                      placeholder={t('settings.providers.apiKeyPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('settings.providers.baseUrl')} ({t('common.optional')})
                    </label>
                    <input
                      type="text"
                      value={editingProvider.baseUrl || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, baseUrl: e.target.value })}
                      className="input-field"
                      placeholder={t('settings.providers.baseUrlPlaceholder')}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveProvider}
                      className="btn-primary"
                    >
                      <Save className="w-4 h-4" />
                      {t('common.save')}
                    </button>
                    <button
                      onClick={() => setEditingProvider(null)}
                      className="btn-secondary"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}

              {settings.providers.length === 0 && !editingProvider ? (
                <div className="card p-8 text-center">
                  <Server className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">{t('settings.providers.noProviders')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {settings.providers.map((provider) => (
                    <div
                      key={provider.id}
                      className="card flex items-center justify-between p-4 hover:shadow-medium transition-shadow duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 dark:text-white">
                          {providerNames[provider.name] || provider.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1 truncate">
                          {showApiKey[provider.id] ? provider.apiKey : '••••••••••••••••'}
                        </p>
                        {provider.baseUrl && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{provider.baseUrl}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => setShowApiKey({ ...showApiKey, [provider.id]: !showApiKey[provider.id] })}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          title={showApiKey[provider.id] ? t('settings.providers.hide') : t('settings.providers.show')}
                        >
                          {showApiKey[provider.id] ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingProvider(provider)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          title={t('common.edit')}
                        >
                          <Save className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteProvider(provider.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('settings.models.title')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.models.description')}</p>
              </div>
              <div className="space-y-4">
                {Object.entries(
                  models.reduce((acc, model) => {
                    if (!acc[model.provider]) acc[model.provider] = []
                    acc[model.provider].push(model)
                    return acc
                  }, {} as Record<string, typeof models>)
                ).map(([provider, providerModels]) => (
                  <div key={provider}>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide px-1">
                      {providerNames[provider] || provider}
                    </h3>
                    <div className="space-y-2">
                      {providerModels.map((model) => (
                        <div
                          key={model.id}
                          onClick={() => dispatch(setActiveModel(model.id))}
                          className={`card flex items-center justify-between p-4 cursor-pointer transition-all duration-200 ${
                            settings.defaultModel === model.id
                              ? 'ring-2 ring-primary bg-blue-50 dark:bg-blue-900/20'
                              : 'hover:shadow-medium'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                              settings.defaultModel === model.id
                                ? 'border-primary bg-primary'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {settings.defaultModel === model.id && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 dark:text-white">{model.nameKey ? t(model.nameKey) : model.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {Math.floor(model.contextWindow / 1000)}{t('settings.models.contextWindow')}
                              </p>
                            </div>
                          </div>
                          {settings.defaultModel === model.id && (
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{t('settings.models.active')}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('settings.general.theme')}</h2>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: 'light', label: t('settings.general.light'), icon: Sun },
                    { id: 'dark', label: t('settings.general.dark'), icon: Moon },
                    { id: 'system', label: t('settings.general.system'), icon: Monitor },
                  ] as const).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`card flex flex-col items-center gap-3 p-5 transition-all duration-200 ${
                        settings.theme === theme.id
                          ? 'ring-2 ring-primary bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:shadow-medium'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        settings.theme === theme.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        <theme.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('settings.general.language')}</h2>
                <div className="space-y-2">
                  {[
                    { id: 'zh-CN', label: '简体中文' },
                    { id: 'en-US', label: 'English' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`card w-full flex items-center justify-between p-4 transition-all duration-200 ${
                        settings.language === lang.id || (!settings.language && lang.id === 'zh-CN')
                          ? 'ring-2 ring-primary bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:shadow-medium'
                      }`}
                    >
                      <span className="font-medium text-gray-800 dark:text-white">{lang.label}</span>
                      {(settings.language === lang.id || (!settings.language && lang.id === 'zh-CN')) && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('settings.general.streamResponse')}</h2>
                <div className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">{t('settings.general.streamResponse')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {t('settings.general.streamResponseDesc')}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.streamResponse}
                        onChange={(e) => dispatch({ type: 'settings/setStreamResponse', payload: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
