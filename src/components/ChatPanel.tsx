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
      <div className="flex items-center justify-between px-5 h-11 border-b border-border flex-shrink-0">
        <span className="text-[13px] font-medium text-foreground/80">Chat</span>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded-sm hover:bg-accent"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        {messages.length === 0 ? (
          <EmptyState onSelect={(prompt) => { setInput(prompt); textareaRef.current?.focus() }} />
        ) : (
          <div>
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
              <div className="px-5 py-4 bg-[hsl(0,0%,11%)]">
                <div className="max-w-2xl mx-auto">
                  <span className="text-[11px] font-medium tracking-wide text-emerald-400/80 mb-1.5 block">PixelElectron</span>
                  <div className="flex items-center gap-1.5 h-5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-1 px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-[12px]">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 items-end rounded-lg border border-border bg-[hsl(0,0%,12%)] p-1.5">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your Minecraft server..."
              className="min-h-[32px] max-h-[140px] resize-none text-[13px] border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-1"
              rows={1}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-7 px-3 text-[12px] rounded-md flex-shrink-0"
            >
              Send
            </Button>
          </div>
          <div className="flex items-center gap-3 mt-1 px-1 text-[10px] text-muted-foreground/60">
            <span>Enter to send</span>
            <span>Shift+Enter for new line</span>
            {!isConnected && <span className="text-amber-500/80">Not connected</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="max-w-md text-center">
        <div className="text-[28px] mb-3 opacity-60">{'\u2B21'}</div>
        <h3 className="text-[15px] font-semibold text-foreground/90 mb-1">PixelElectron</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-8">
          AI-powered Minecraft server management. Build structures, create ranks, configure plugins.
        </p>
        <div className="grid grid-cols-2 gap-2 text-left">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelect(s.prompt)}
              className="px-3 py-2.5 rounded-md border border-border hover:bg-accent/50 transition-colors text-left group"
            >
              <div className="text-[12px] font-medium text-foreground/80 group-hover:text-foreground mb-0.5">{s.title}</div>
              <div className="text-[11px] text-muted-foreground leading-snug">{s.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  { title: 'Create a rank', description: 'Pharaoh rank with gold prefix', prompt: 'Create a Pharaoh rank with gold prefix, gamemode and teleport permissions' },
  { title: 'Build with Falcraft', description: 'AI-generated structures', prompt: 'Build a medieval castle using Falcraft at the spawn area, size 64' },
  { title: 'Set up crates', description: 'Legendary crate with rewards', prompt: 'Set up a legendary crate with diamond sword, enchanted armor, and 64 diamonds' },
  { title: 'Custom command', description: '/smite with cooldown', prompt: 'Create a /smite command for the Pharaoh rank that strikes lightning, usable once per hour' },
]
