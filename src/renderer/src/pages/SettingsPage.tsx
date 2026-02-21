import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector, useAppDispatch } from '../hooks/useRedux'
import { addProvider, updateProvider, deleteProvider, setTheme, setLanguage, Provider } from '../store/slices/settings'
import { setActiveModel } from '../store/slices/models'
import { 
  Search, Check, Eye, EyeOff, Plus, Trash2, Settings2, 
  Cpu, Globe, Zap, Server, Bot, Sparkles, Brain, 
  ChevronRight, ExternalLink, ToggleLeft, ToggleRight,
  MessageSquare, Image, Wrench, Keyboard, Database, HelpCircle,
  LayoutGrid, Monitor, Moon, Sun
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Provider icons mapping
const providerIcons: Record<string, React.FC<{ className?: string }>> = {
  openai: Sparkles,
  anthropic: Brain,
  google: Zap,
  groq: Zap,
  deepseek: Brain,
  ollama: Server,
  openrouter: Globe,
  siliconflow: Cpu,
  default: Bot,
}

// Provider colors
const providerColors: Record<string, string> = {
  openai: 'bg-emerald-500',
  anthropic: 'bg-orange-500',
  google: 'bg-blue-500',
  groq: 'bg-purple-500',
  deepseek: 'bg-indigo-500',
  ollama: 'bg-gray-500',
  openrouter: 'bg-cyan-500',
  siliconflow: 'bg-pink-500',
}

// Left sidebar menu items
const settingsMenuItems = [
  { id: 'providers', label: 'Model Provider', icon: Server },
  { id: 'default-model', label: 'Default Model', icon: Cpu },
  { id: 'web-search', label: 'Web Search', icon: Globe },
  { id: 'mcp-servers', label: 'MCP Servers', icon: Wrench },
  { id: 'general', label: 'General Settings', icon: Settings2 },
  { id: 'display', label: 'Display Settings', icon: Monitor },
  { id: 'mini-apps', label: 'Mini Apps Settings', icon: LayoutGrid },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'quick-assistant', label: 'Quick Assistant', icon: MessageSquare },
  { id: 'quick-phrases', label: 'Quick Phrases', icon: MessageSquare },
  { id: 'data', label: 'Data Settings', icon: Database },
  { id: 'about', label: 'About & Feedback', icon: HelpCircle },
]

// Extended provider data with models
interface ExtendedProvider extends Provider {
  models: Array<{
    id: string
    name: string
    group: string
    description?: string
    enabled: boolean
  }>
}

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const settings = useAppSelector((state) => state.settings)
  const models = useAppSelector((state) => state.models.items)
  
  const [activeMenuItem, setActiveMenuItem] = useState('providers')
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [editingProvider, setEditingProvider] = useState<ExtendedProvider | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Group models by their group
  const groupModels = (providerModels: typeof models) => {
    const groups: Record<string, typeof models> = {}
    providerModels.forEach((model) => {
      const group = model.provider
      if (!groups[group]) groups[group] = []
      groups[group].push(model)
    })
    return groups
  }

  // Get provider display name
  const getProviderName = (id: string) => {
    const names: Record<string, string> = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google AI',
      groq: 'Groq',
      deepseek: 'DeepSeek',
      ollama: 'Ollama',
      openrouter: 'OpenRouter',
      siliconflow: 'SiliconFlow',
    }
    return names[id] || id
  }

  // Filter providers based on search
  const filteredProviders = useMemo(() => {
    if (!searchQuery) return settings.providers
    return settings.providers.filter((p) => 
      getProviderName(p.name).toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [settings.providers, searchQuery])

  // Get selected provider
  const selectedProvider = useMemo(() => {
    if (!selectedProviderId) return settings.providers[0] || null
    return settings.providers.find((p) => p.id === selectedProviderId) || settings.providers[0] || null
  }, [selectedProviderId, settings.providers])

  // Get models for selected provider
  const selectedProviderModels = useMemo(() => {
    if (!selectedProvider) return []
    return models.filter((m) => m.provider === selectedProvider.name)
  }, [selectedProvider, models])

  // Group models
  const groupedModels = useMemo(() => groupModels(selectedProviderModels), [selectedProviderModels])

  // Toggle group expansion
  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) {
        next.delete(group)
      } else {
        next.add(group)
      }
      return next
    })
  }

  // Handle provider toggle
  const handleToggleProvider = (provider: Provider) => {
    dispatch(updateProvider({ ...provider, enabled: !provider.enabled }))
  }

  // Handle add provider
  const handleAddProvider = () => {
    const newProvider: ExtendedProvider = {
      id: Date.now().toString(),
      name: 'openai',
      apiKey: '',
      baseUrl: '',
      enabled: true,
      models: [],
    }
    setEditingProvider(newProvider)
  }

  // Handle save provider
  const handleSaveProvider = () => {
    if (!editingProvider) return
    if (editingProvider.name && editingProvider.apiKey) {
      const { models, ...providerData } = editingProvider
      const existing = settings.providers.find((p) => p.id === editingProvider.id)
      if (existing) {
        dispatch(updateProvider(providerData))
      } else {
        dispatch(addProvider(providerData))
      }
      setEditingProvider(null)
      if (!selectedProviderId) {
        setSelectedProviderId(editingProvider.id)
      }
    }
  }

  // Handle delete provider
  const handleDeleteProvider = (id: string) => {
    dispatch(deleteProvider(id))
    if (selectedProviderId === id) {
      setSelectedProviderId(null)
    }
  }

  // Handle theme change
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(theme))
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
    }
  }

  // Handle language change
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    dispatch(setLanguage(lang))
    localStorage.setItem('language', lang)
  }

  // Get provider icon
  const ProviderIcon = selectedProvider 
    ? (providerIcons[selectedProvider.name] || providerIcons.default)
    : providerIcons.default

  // Get provider color
  const providerColor = selectedProvider
    ? (providerColors[selectedProvider.name] || 'bg-gray-500')
    : 'bg-gray-500'

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Left Sidebar - Settings Menu */}
      <div className="w-56 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h1>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {settingsMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenuItem(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                activeMenuItem === item.id
                  ? 'text-primary bg-primary/5 dark:bg-primary/10 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {activeMenuItem === item.id && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Middle Panel - Provider List */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredProviders.map((provider) => {
            const Icon = providerIcons[provider.name] || providerIcons.default
            const isSelected = selectedProvider?.id === provider.id
            return (
              <button
                key={provider.id}
                onClick={() => setSelectedProviderId(provider.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-gray-800 ${
                  isSelected
                    ? 'bg-primary/5 dark:bg-primary/10'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${providerColors[provider.name] || 'bg-gray-500'} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {getProviderName(provider.name)}
                  </div>
                </div>
                {provider.enabled && (
                  <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                    ON
                  </span>
                )}
              </button>
            )
          })}
          {filteredProviders.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No providers found
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleAddProvider}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Right Panel - Provider Details */}
      <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto">
        {selectedProvider ? (
          <div className="p-6 space-y-6">
            {/* Provider Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${providerColor} flex items-center justify-center shadow-lg`}>
                  <ProviderIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {getProviderName(selectedProvider.name)}
                  </h2>
                  <a 
                    href="#" 
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Docs
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleToggleProvider(selectedProvider)}
                className="text-3xl"
              >
                {selectedProvider.enabled ? (
                  <ToggleRight className="w-12 h-8 text-primary" />
                ) : (
                  <ToggleLeft className="w-12 h-8 text-gray-400" />
                )}
              </button>
            </div>

            {/* API Key Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                API Key
              </label>
              {editingProvider && editingProvider.id === selectedProvider.id ? (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={editingProvider.apiKey}
                      onChange={(e) => setEditingProvider({ ...editingProvider, apiKey: e.target.value })}
                      placeholder="Enter your API key"
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none pr-20"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProvider}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingProvider(null)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-600 dark:text-gray-400">
                    {selectedProvider.apiKey ? '••••••••••••••••' : 'Not configured'}
                  </div>
                  <button
                    onClick={() => setEditingProvider({ ...selectedProvider, models: [] })}
                    className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {/* TODO: Check API key */}}
                    className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                  >
                    Check
                  </button>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <a href="#" className="text-primary hover:underline">Get API Key</a>
                {' '}•{' '}
                <a href="#" className="text-primary hover:underline">Charge</a>
              </p>
            </div>

            {/* API Host Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                API Host
              </label>
              {editingProvider && editingProvider.id === selectedProvider.id ? (
                <input
                  type="text"
                  value={editingProvider.baseUrl || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              ) : (
                <div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                  {selectedProvider.baseUrl || `https://api.${selectedProvider.name}.com/v1`}
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Ending with / ignores v1, ending with # forces use of input address
              </p>
            </div>

            {/* Models Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Models
                </label>
                <button className="text-gray-400 hover:text-gray-600">
                  <Search className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(groupedModels).map(([group, groupModels]) => (
                  <div key={group} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleGroup(group)}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-left"
                    >
                      {expandedGroups.has(group) ? (
                        <ChevronRight className="w-4 h-4 text-gray-400 rotate-90 transition-transform" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 transition-transform" />
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">
                        {group}
                      </span>
                    </button>
                    {expandedGroups.has(group) && (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {groupModels.map((model) => (
                          <div
                            key={model.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {model.nameKey ? t(model.nameKey) : model.name}
                                </div>
                                {model.name.includes('embedding') && (
                                  <span className="text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded">
                                    Embedding
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Settings2 className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {selectedProviderModels.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No models available for this provider
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Check{' '}
                  <a href="#" className="text-primary hover:underline">
                    {getProviderName(selectedProvider.name)} Docs
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Models</a>
                  {' '}for more details
                </p>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
                  <Settings2 className="w-4 h-4" />
                  Manage
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Delete Provider */}
            <button
              onClick={() => handleDeleteProvider(selectedProvider.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Provider
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Select a provider to configure
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
