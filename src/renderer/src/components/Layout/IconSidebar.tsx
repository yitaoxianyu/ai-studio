import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux'
import { useNavigate, useLocation } from 'react-router-dom'
import { setTheme } from '../../store/slices/settings'
import { 
  MessageSquare, 
  Settings, 
  Sun, 
  Moon, 
  Monitor,
  Sparkles,
  Bot,
  Image as ImageIcon,
  Wrench,
  Globe
} from 'lucide-react'

interface NavItem {
  id: string
  icon: React.FC<{ className?: string }>
  label: string
  path: string
}

const navItems: NavItem[] = [
  { id: 'chat', icon: MessageSquare, label: 'Chat', path: '/' },
  { id: 'assistants', icon: Bot, label: 'Assistants', path: '/assistants' },
  { id: 'images', icon: ImageIcon, label: 'Images', path: '/images' },
  { id: 'tools', icon: Wrench, label: 'Tools', path: '/tools' },
  { id: 'web', icon: Globe, label: 'Web', path: '/web' },
]

const IconSidebar: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const settings = useAppSelector((state) => state.settings)

  const handleNavClick = (path: string) => {
    navigate(path)
  }

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark'
    dispatch(setTheme(newTheme))
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleOpenSettings = () => {
    navigate('/settings')
  }

  return (
    <div className="w-14 bg-sidebar-bg dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      {/* Logo */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              title={item.label}
              className={`mx-2 p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          )
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1">
        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          title={settings.theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
          className="mx-1 p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 flex items-center justify-center"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Settings */}
        <button
          onClick={handleOpenSettings}
          title={t('sidebar.settings')}
          className={`mx-1 p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
            location.pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default IconSidebar
