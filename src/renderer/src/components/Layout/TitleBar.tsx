import React from 'react'
import { useTranslation } from 'react-i18next'
import { Minus, Square, X } from 'lucide-react'

const TitleBar: React.FC = () => {
  const { t } = useTranslation()
  const isMac = navigator.platform.toLowerCase().includes('mac')

  const handleMinimize = async () => {
    await window.api.windowMinimize()
  }

  const handleMaximize = async () => {
    await window.api.windowMaximize()
  }

  const handleClose = async () => {
    await window.api.windowClose()
  }

  return (
    <div className="drag-region h-10 bg-white dark:bg-gray-900 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center">
        {isMac && <div className="w-[70px]" />}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{t('common.appName')}</span>
        </div>
      </div>
      {!isMac && (
        <div className="no-drag flex items-center">
          <button
            onClick={handleMinimize}
            className="w-12 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <Minus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={handleMaximize}
            className="w-12 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <Square className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={handleClose}
            className="w-12 h-10 flex items-center justify-center hover:bg-red-500 transition-colors duration-200 group"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-white" />
          </button>
        </div>
      )}
      {isMac && <div className="w-[70px]" />}
    </div>
  )
}

export default TitleBar
