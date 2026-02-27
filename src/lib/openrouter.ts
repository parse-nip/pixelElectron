import type { OpenRouterMessage, OpenRouterResponse } from '@/types'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function sendChatMessage(
  messages: OpenRouterMessage[],
  apiKey: string,
  model: string,
): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://pixelelectron.app',
      'X-Title': 'PixelElectron',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`)
  }

  const data: OpenRouterResponse = await response.json()

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from AI model')
  }

  return data.choices[0].message.content
}

export async function streamChatMessage(
  messages: OpenRouterMessage[],
  apiKey: string,
  model: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
): Promise<void> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://pixelelectron.app',
      'X-Title': 'PixelElectron',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)
      if (data === '[DONE]') {
        onDone()
        return
      }
      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content
        if (content) onChunk(content)
      } catch {
        // skip malformed chunks
      }
    }
  }

  onDone()
}

export const AVAILABLE_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', provider: 'meta', free: true },
  { id: 'qwen/qwen3-30b-a3b:free', name: 'Qwen3 30B', provider: 'qwen', free: true },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', provider: 'google', free: true },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1', provider: 'mistral', free: true },
  { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek V3', provider: 'deepseek', free: true },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Nemotron 70B', provider: 'nvidia', free: true },
]
