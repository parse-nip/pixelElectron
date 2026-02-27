import type { OpenRouterMessage, OpenRouterResponse } from '@/types'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function sendChatMessage(
  messages: OpenRouterMessage[],
  apiKey: string,
  model: string,
): Promise<string> {
  const modelsToTry = [model, ...AVAILABLE_MODELS.map(m => m.id).filter(id => id !== model)]

  for (const tryModel of modelsToTry) {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pixelelectron.app',
        'X-Title': 'PixelElectron',
      },
      body: JSON.stringify({
        model: tryModel,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    })

    if (response.status === 429) {
      continue
    }

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const err = JSON.parse(errorText)
        if (err.error?.code === 429) continue
      } catch { /* not JSON */ }
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`)
    }

    const data: OpenRouterResponse = await response.json()
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content
    }
  }

  throw new Error('All models are currently rate-limited. Please try again in a minute.')
}

export async function streamChatMessage(
  messages: OpenRouterMessage[],
  apiKey: string,
  model: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
): Promise<void> {
  const modelsToTry = [model, ...AVAILABLE_MODELS.map(m => m.id).filter(id => id !== model)]
  let response: Response | null = null

  for (const tryModel of modelsToTry) {
    const r = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pixelelectron.app',
        'X-Title': 'PixelElectron',
      },
      body: JSON.stringify({
        model: tryModel,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      }),
    })

    if (r.status === 429) continue
    if (!r.ok) {
      const text = await r.text()
      try { if (JSON.parse(text).error?.code === 429) continue } catch { /* */ }
      throw new Error(`OpenRouter API error (${r.status}): ${text}`)
    }
    response = r
    break
  }

  if (!response) throw new Error('All models are currently rate-limited. Please try again in a minute.')

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
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1', provider: 'mistral', free: true },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', provider: 'meta', free: true },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 405B', provider: 'nous', free: true },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', provider: 'google', free: true },
]
