import { useState, useCallback, useRef } from 'react'
import type { ChatMessage, OpenRouterMessage, ParsedCommand, ParsedFileAction } from '@/types'
import { streamChatMessage, sendChatMessage } from '@/lib/openrouter'
import { SYSTEM_PROMPT, parseCommandBlocks, parseFileBlocks } from '@/lib/minecraft-agent'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useChat(apiKey: string, model: string, serverDir: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  const sendMessage = useCallback(async (content: string) => {
    if (!apiKey) {
      setError('Please set your OpenRouter API key in Settings')
      return
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)
    abortRef.current = false

    const assistantId = generateId()

    const history: OpenRouterMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content },
    ]

    try {
      let fullContent = ''

      setMessages(prev => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() },
      ])

      try {
        await streamChatMessage(
          history, apiKey, model,
          (chunk) => {
            if (abortRef.current) return
            fullContent += chunk
            setMessages(prev =>
              prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m),
            )
          },
          () => { /* done */ },
        )
      } catch {
        fullContent = await sendChatMessage(history, apiKey, model)
      }

      const commandBlocks = parseCommandBlocks(fullContent)
      const commands: ParsedCommand[] = commandBlocks.flat().map(cmd => ({
        command: cmd,
        status: 'pending' as const,
      }))

      const fileBlocks = parseFileBlocks(fullContent)
      const files: ParsedFileAction[] = fileBlocks.map(f => ({
        path: f.path,
        content: f.content,
        status: 'pending' as const,
      }))

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content: fullContent,
                commands: commands.length > 0 ? commands : undefined,
                files: files.length > 0 ? files : undefined,
              }
            : m,
        ),
      )
    } catch (err: any) {
      setError(err?.message || 'Failed to get AI response')
      setMessages(prev => prev.filter(m => m.id !== assistantId))
    } finally {
      setIsLoading(false)
    }
  }, [apiKey, model, messages])

  const executeCommand = useCallback(async (messageId: string, commandIndex: number) => {
    const api = window.electronAPI
    if (!api) {
      setError('RCON not available (running outside Electron)')
      return
    }

    setMessages(prev =>
      prev.map(m => {
        if (m.id !== messageId || !m.commands) return m
        const commands = [...m.commands]
        commands[commandIndex] = { ...commands[commandIndex], status: 'executing' }
        return { ...m, commands }
      }),
    )

    const msg = messages.find(m => m.id === messageId)
    const command = msg?.commands?.[commandIndex]?.command
    if (!command) return

    const result = await api.rcon.send(command)

    setMessages(prev =>
      prev.map(m => {
        if (m.id !== messageId || !m.commands) return m
        const commands = [...m.commands]
        commands[commandIndex] = {
          ...commands[commandIndex],
          status: result.success ? 'success' : 'error',
          response: result.success ? result.response : result.error,
        }
        return { ...m, commands }
      }),
    )
  }, [messages])

  const executeAllCommands = useCallback(async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId)
    if (!msg?.commands) return

    for (let i = 0; i < msg.commands.length; i++) {
      if (msg.commands[i].status === 'pending') {
        await executeCommand(messageId, i)
        await new Promise(resolve => setTimeout(resolve, 250))
      }
    }
  }, [messages, executeCommand])

  const createFile = useCallback(async (messageId: string, fileIndex: number) => {
    const api = window.electronAPI
    if (!api) {
      setError('File system not available (running outside Electron)')
      return
    }
    if (!serverDir) {
      setError('Set the server directory in the sidebar to create files')
      return
    }

    setMessages(prev =>
      prev.map(m => {
        if (m.id !== messageId || !m.files) return m
        const files = [...m.files]
        files[fileIndex] = { ...files[fileIndex], status: 'creating' }
        return { ...m, files }
      }),
    )

    const msg = messages.find(m => m.id === messageId)
    const file = msg?.files?.[fileIndex]
    if (!file) return

    const result = await api.fs.writeFile(file.path, file.content, serverDir)

    setMessages(prev =>
      prev.map(m => {
        if (m.id !== messageId || !m.files) return m
        const files = [...m.files]
        files[fileIndex] = {
          ...files[fileIndex],
          status: result.success ? 'success' : 'error',
          error: result.error,
        }
        return { ...m, files }
      }),
    )
  }, [messages, serverDir])

  const createAllFiles = useCallback(async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId)
    if (!msg?.files) return

    for (let i = 0; i < msg.files.length; i++) {
      if (msg.files[i].status === 'pending') {
        await createFile(messageId, i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }, [messages, createFile])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    executeCommand,
    executeAllCommands,
    createFile,
    createAllFiles,
    clearMessages,
    setError,
  }
}
