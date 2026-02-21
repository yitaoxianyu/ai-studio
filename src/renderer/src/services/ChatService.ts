import OpenAI from 'openai'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatOptions {
  provider: string
  apiKey: string
  baseUrl?: string
  model: string
  messages: Message[]
  stream?: boolean
  onStream?: (content: string) => void
}

class ChatService {
  async sendMessage(options: ChatOptions): Promise<string> {
    const { provider, apiKey, baseUrl, model, messages, stream, onStream } = options

    switch (provider) {
      case 'openai':
      case 'openrouter':
      case 'ollama':
      case 'custom':
        return this.sendOpenAICompatible(options)
      case 'anthropic':
        return this.sendAnthropic(options)
      case 'google':
        return this.sendGoogle(options)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  private async sendOpenAICompatible(options: ChatOptions): Promise<string> {
    const { apiKey, baseUrl, model, messages, stream, onStream } = options

    const client = new OpenAI({
      apiKey: apiKey || 'dummy',
      baseURL: baseUrl || 'https://api.openai.com/v1',
      dangerouslyAllowBrowser: true,
    })

    if (stream && onStream) {
      const streamResponse = await client.chat.completions.create({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      })

      let fullContent = ''
      for await (const chunk of streamResponse) {
        const content = chunk.choices[0]?.delta?.content || ''
        fullContent += content
        onStream(fullContent)
      }
      return fullContent
    }

    const response = await client.chat.completions.create({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    return response.choices[0]?.message?.content || ''
  }

  private async sendAnthropic(options: ChatOptions): Promise<string> {
    const { apiKey, model, messages, stream, onStream } = options

    const systemMessage = messages.find((m) => m.role === 'system')
    const chatMessages = messages.filter((m) => m.role !== 'system')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemMessage?.content,
        messages: chatMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: stream,
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    if (stream && onStream) {
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  fullContent += data.delta.text
                  onStream(fullContent)
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
      return fullContent
    }

    const data = await response.json()
    return data.content[0]?.text || ''
  }

  private async sendGoogle(options: ChatOptions): Promise<string> {
    const { apiKey, model, messages, stream, onStream } = options

    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const systemInstruction = messages.find((m) => m.role === 'system')?.content

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${
      stream ? 'streamGenerateContent' : 'generateContent'
    }?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      }),
    })

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.statusText}`)
    }

    if (stream && onStream) {
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          try {
            const data = JSON.parse(chunk)
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
            if (text) {
              fullContent = text
              onStream(fullContent)
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
      return fullContent
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }
}

export default new ChatService()
