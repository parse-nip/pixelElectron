import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ChatMessage as ChatMessageType, ParsedCommand } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
  onExecuteCommand: (commandIndex: number) => void
  onExecuteAll: () => void
  isConnected: boolean
}

function CommandBlock({
  commands,
  onExecute,
  onExecuteAll,
  isConnected,
}: {
  commands: ParsedCommand[]
  onExecute: (index: number) => void
  onExecuteAll: () => void
  isConnected: boolean
}) {
  const hasPending = commands.some(c => c.status === 'pending')

  return (
    <div className="my-3 rounded-lg border border-border bg-background/50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">
          Minecraft Commands
        </span>
        {hasPending && isConnected && (
          <Button size="sm" variant="default" className="h-6 text-xs px-2" onClick={onExecuteAll}>
            Execute All
          </Button>
        )}
      </div>
      <div className="p-2 space-y-1">
        {commands.map((cmd, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <code className="flex-1 text-sm font-mono px-2 py-1 rounded bg-muted/30 text-green-400">
              {cmd.command}
            </code>
            <StatusBadge status={cmd.status} />
            {cmd.status === 'pending' && isConnected && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onExecute(i)}
              >
                Run
              </Button>
            )}
          </div>
        ))}
      </div>
      {commands.some(c => c.response) && (
        <div className="border-t border-border p-2 space-y-1">
          {commands.filter(c => c.response).map((cmd, i) => (
            <div key={i} className="text-xs font-mono text-muted-foreground px-2">
              <span className="text-primary">&gt;</span> {cmd.command}: {cmd.response}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: ParsedCommand['status'] }) {
  switch (status) {
    case 'pending':
      return null
    case 'executing':
      return <Badge variant="outline" className="text-xs h-5 animate-pulse text-yellow-400 border-yellow-400/30">Running</Badge>
    case 'success':
      return <Badge variant="outline" className="text-xs h-5 text-green-400 border-green-400/30">Done</Badge>
    case 'error':
      return <Badge variant="outline" className="text-xs h-5 text-red-400 border-red-400/30">Error</Badge>
  }
}

function renderContent(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const segments = content.split(/(```minecraft\n[\s\S]*?```)/g)

  segments.forEach((segment, i) => {
    if (segment.startsWith('```minecraft')) {
      return
    }

    const codeBlockSegments = segment.split(/(```[\w]*\n[\s\S]*?```)/g)
    codeBlockSegments.forEach((sub, j) => {
      if (sub.startsWith('```')) {
        const langMatch = sub.match(/```(\w*)\n/)
        const code = sub.replace(/```\w*\n/, '').replace(/```$/, '')
        parts.push(
          <pre key={`${i}-${j}`} className="my-2 p-3 rounded-lg bg-muted/50 border border-border overflow-x-auto">
            {langMatch?.[1] && (
              <div className="text-xs text-muted-foreground mb-1">{langMatch[1]}</div>
            )}
            <code className="text-sm font-mono text-foreground">{code}</code>
          </pre>
        )
      } else {
        const lines = sub.split('\n')
        lines.forEach((line, k) => {
          if (line.trim() === '') {
            parts.push(<br key={`${i}-${j}-${k}`} />)
            return
          }

          let processed: React.ReactNode = line

          const boldParts = line.split(/(\*\*.*?\*\*)/g)
          if (boldParts.length > 1) {
            processed = boldParts.map((part, m) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={m}>{part.slice(2, -2)}</strong>
              }
              return renderInlineCode(part, m)
            })
          } else {
            processed = renderInlineCode(line, 0)
          }

          parts.push(
            <span key={`${i}-${j}-${k}`}>
              {processed}
              {k < lines.length - 1 ? '\n' : ''}
            </span>
          )
        })
      }
    })
  })

  return parts
}

function renderInlineCode(text: string, key: number): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g)
  if (parts.length === 1) return text

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${key}-${i}`} className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-primary">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

export function ChatMessageComponent({ message, onExecuteCommand, onExecuteAll, isConnected }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 px-4 py-3 ${isUser ? '' : 'bg-muted/20'}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold ${
        isUser
          ? 'bg-primary/20 text-primary'
          : 'bg-secondary text-secondary-foreground'
      }`}>
        {isUser ? 'U' : 'P'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-1">
          {isUser ? 'You' : 'PixelElectron'}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {renderContent(message.content)}
        </div>
        {message.commands && message.commands.length > 0 && (
          <CommandBlock
            commands={message.commands}
            onExecute={onExecuteCommand}
            onExecuteAll={onExecuteAll}
            isConnected={isConnected}
          />
        )}
      </div>
    </div>
  )
}
