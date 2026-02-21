import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ThinkingEffectProps {
  isThinking?: boolean
}

const ThinkingEffect: React.FC<ThinkingEffectProps> = ({ isThinking = true }) => {
  const { t } = useTranslation()
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isThinking) return

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [isThinking])

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {t('chat.thinking')}{dots}
      </span>
    </div>
  )
}

export default ThinkingEffect
