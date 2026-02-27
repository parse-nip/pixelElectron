import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessageComponent } from '@/components/ChatMessage'
import type { ChatMessage } from '@/types'

interface ChatPanelProps {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  isConnected: boolean
  onSendMessage: (content: string) => void
  onExecuteCommand: (messageId: string, commandIndex: number) => void
  onExecuteAll: (messageId: string) => void
  onClear: () => void
}

export function ChatPanel({
  messages,
  isLoading,
  error,
  isConnected,
  onSendMessage,
  onExecuteCommand,
  onExecuteAll,
  onClear,
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSendMessage(trimmed)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-xs font-bold">P</span>
          </div>
          <h2 className="text-sm font-semibold">PixelElectron Chat</h2>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-3xl">&#x26CF;</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to PixelElectron</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Your AI-powered Minecraft server assistant. Ask me to build structures,
              create ranks, set up plugins, and more.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  className="text-left text-xs p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setInput(suggestion.prompt)
                    textareaRef.current?.focus()
                  }}
                >
                  <div className="font-medium mb-0.5">{suggestion.title}</div>
                  <div className="text-muted-foreground">{suggestion.description}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {messages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                isConnected={isConnected}
                onExecuteCommand={(idx) => onExecuteCommand(message.id, idx)}
                onExecuteAll={() => onExecuteAll(message.id)}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-3 px-4 py-3 bg-muted/20">
                <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold bg-secondary text-secondary-foreground">
                  P
                </div>
                <div className="flex items-center gap-1 pt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask PixelElectron to build, create ranks, set up plugins..."
            className="min-h-[40px] max-h-[160px] resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-10 px-4"
          >
            Send
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
          <span>Enter to send</span>
          <span className="text-border">|</span>
          <span>Shift+Enter for new line</span>
          {!isConnected && (
            <>
              <span className="text-border">|</span>
              <span className="text-yellow-500">Server not connected</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  {
    title: 'Create a Rank',
    description: 'Set up a new rank with permissions',
    prompt: 'Create a Pharaoh rank with gold prefix, gamemode and teleport permissions',
  },
  {
    title: 'Build a Structure',
    description: 'Build something on the server',
    prompt: 'Build a stone colosseum at coordinates 100 64 100, about 50 blocks wide',
  },
  {
    title: 'Set up Crates',
    description: 'Configure a crate with rewards',
    prompt: 'Set up a legendary crate with diamond sword, enchanted armor, and 64 diamonds as rewards',
  },
  {
    title: 'Custom Command',
    description: 'Create a command for a rank',
    prompt: 'Create a /smite command for the Pharaoh rank that strikes lightning at a target player, usable once per hour',
  },
]
