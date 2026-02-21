import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, RefreshCw, Trash2, MoreHorizontal } from 'lucide-react'

interface MessageActionsProps {
  onCopy?: () => void
  onRegenerate?: () => void
  onDelete?: () => void
  isUser?: boolean
}

const MessageActions: React.FC<MessageActionsProps> = ({
  onCopy,
  onRegenerate,
  onDelete,
  isUser = false,
}) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const handleCopy = async () => {
    if (onCopy) {
      await onCopy()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {!isUser && onRegenerate && (
        <button
          onClick={onRegenerate}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
          title={t('chat.regenerate')}
        >
          <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      )}
      
      {onCopy && (
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
          title={t('chat.copy')}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      )}

      <div className="relative">
        <button
          onClick={() => setShowMore(!showMore)}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>

        {showMore && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMore(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1 animate-fade-in">
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete()
                    setShowMore(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('chat.delete')}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MessageActions
