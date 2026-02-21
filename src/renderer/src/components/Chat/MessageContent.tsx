import React, { useState } from 'react'
import { Copy, Check, Play } from 'lucide-react'

interface MessageContentProps {
  content: string
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="my-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{language || 'code'}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto bg-gray-50 dark:bg-gray-900">
        <code className="text-sm font-mono text-gray-800 dark:text-gray-200">{code}</code>
      </pre>
    </div>
  )
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  const parseContent = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let key = 0
    
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
    const inlineCodeRegex = /`([^`]+)`/g
    const boldRegex = /\*\*([^*]+)\*\*/g
    const italicRegex = /\*([^*]+)\*/g
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const headerRegex = /^(#{1,6})\s+(.+)$/gm
    const listRegex = /^(\s*)[-*+]\s+(.+)$/gm
    const orderedListRegex = /^(\s*)(\d+)\.\s+(.+)$/gm
    const blockquoteRegex = /^(?:&gt;|>)\s+(.+)$/gm
    
    let lastIndex = 0
    let match
    
    const processedText = text
      .replace(headerRegex, (_, hashes, content) => {
        const level = hashes.length
        return `<h${level}>${content}</h${level}>`
      })
      .replace(listRegex, (_, indent, content) => {
        return `<li>${content}</li>`
      })
      .replace(orderedListRegex, (_, indent, num, content) => {
        return `<li>${content}</li>`
      })
      .replace(blockquoteRegex, (_, content) => {
        return `<blockquote>${content}</blockquote>`
      })
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={key++}>
            {parseInlineContent(text.slice(lastIndex, match.index))}
          </span>
        )
      }
      
      const language = match[1] || ''
      const code = match[2].trim()
      parts.push(<CodeBlock key={key++} language={language} code={code} />)
      lastIndex = match.index + match[0].length
    }
    
    if (lastIndex < text.length) {
      parts.push(
        <span key={key++}>
          {parseInlineContent(text.slice(lastIndex))}
        </span>
      )
    }
    
    return parts
  }
  
  const parseInlineContent = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let key = 0
    let lastIndex = 0
    
    const patterns = [
      { regex: /`([^`]+)`/g, type: 'code' },
      { regex: /\*\*([^*]+)\*\*/g, type: 'bold' },
      { regex: /\*([^*]+)\*/g, type: 'italic' },
      { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
    ]
    
    interface MatchInfo {
      index: number
      endIndex: number
      content: string
      type: string
      url?: string
    }
    
    const allMatches: MatchInfo[] = []
    
    patterns.forEach(({ regex, type }) => {
      let match
      const regexCopy = new RegExp(regex.source, regex.flags)
      while ((match = regexCopy.exec(text)) !== null) {
        if (type === 'link') {
          allMatches.push({
            index: match.index,
            endIndex: match.index + match[0].length,
            content: match[1],
            type,
            url: match[2],
          })
        } else {
          allMatches.push({
            index: match.index,
            endIndex: match.index + match[0].length,
            content: match[1],
            type,
          })
        }
      }
    })
    
    allMatches.sort((a, b) => a.index - b.index)
    
    const validMatches: MatchInfo[] = []
    for (const match of allMatches) {
      let isOverlapping = false
      for (const existing of validMatches) {
        if (
          (match.index >= existing.index && match.index < existing.endIndex) ||
          (match.endIndex > existing.index && match.endIndex <= existing.endIndex)
        ) {
          isOverlapping = true
          break
        }
      }
      if (!isOverlapping) {
        validMatches.push(match)
      }
    }
    
    validMatches.sort((a, b) => a.index - b.index)
    
    for (const match of validMatches) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      
      switch (match.type) {
        case 'code':
          parts.push(
            <code
              key={key++}
              className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 rounded text-sm font-mono"
            >
              {match.content}
            </code>
          )
          break
        case 'bold':
          parts.push(
            <strong key={key++} className="font-semibold text-gray-900 dark:text-gray-100">
              {match.content}
            </strong>
          )
          break
        case 'italic':
          parts.push(
            <em key={key++} className="italic">
              {match.content}
            </em>
          )
          break
        case 'link':
          parts.push(
            <a
              key={key++}
              href={match.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {match.content}
            </a>
          )
          break
      }
      
      lastIndex = match.endIndex
    }
    
    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex)
      const lines = remaining.split('\n')
      
      lines.forEach((line, index) => {
        if (index > 0) {
          parts.push(<br key={key++} />)
        }
        
        if (line.startsWith('### ')) {
          parts.push(
            <h3 key={key++} className="text-lg font-bold mt-3 mb-2">
              {line.slice(4)}
            </h3>
          )
        } else if (line.startsWith('## ')) {
          parts.push(
            <h2 key={key++} className="text-xl font-bold mt-3 mb-2">
              {line.slice(3)}
            </h2>
          )
        } else if (line.startsWith('# ')) {
          parts.push(
            <h1 key={key++} className="text-2xl font-bold mt-3 mb-2">
              {line.slice(2)}
            </h1>
          )
        } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('+ ')) {
          parts.push(
            <li key={key++} className="ml-4 list-disc">
              {line.slice(2)}
            </li>
          )
        } else if (/^\d+\.\s/.test(line)) {
          const content = line.replace(/^\d+\.\s/, '')
          parts.push(
            <li key={key++} className="ml-4 list-decimal">
              {content}
            </li>
          )
        } else if (line.startsWith('> ') || line.startsWith('&gt; ')) {
          const content = line.replace(/^(?:&gt;|>)\s*/, '')
          parts.push(
            <blockquote
              key={key++}
              className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2 text-gray-600 dark:text-gray-400"
            >
              {content}
            </blockquote>
          )
        } else {
          parts.push(line)
        }
      })
    }
    
    return parts
  }
  
  return (
    <div className="message-content prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
      {parseContent(content)}
    </div>
  )
}

export default MessageContent
