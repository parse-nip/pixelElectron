import { Button } from '@/components/ui/button'
import type { ChatMessage as ChatMessageType, ParsedCommand, ParsedFileAction } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
  onExecuteCommand: (commandIndex: number) => void
  onExecuteAll: () => void
  onCreateFile: (fileIndex: number) => void
  onCreateAllFiles: () => void
  isConnected: boolean
  hasServerDir: boolean
}

// ── Command Block ──

function CommandBlock({
  commands, onExecute, onExecuteAll, isConnected,
}: {
  commands: ParsedCommand[]
  onExecute: (index: number) => void
  onExecuteAll: () => void
  isConnected: boolean
}) {
  const hasPending = commands.some(c => c.status === 'pending')

  return (
    <div className="my-3 rounded-md border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[hsl(0,0%,12%)] border-b border-border">
        <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
          Commands
        </span>
        <div className="flex items-center gap-2">
          {!isConnected && <span className="text-[10px] text-amber-500/80">Not connected</span>}
          {hasPending && isConnected && (
            <Button size="sm" className="h-5 text-[10px] px-2 rounded-sm bg-primary/90 hover:bg-primary" onClick={onExecuteAll}>
              Run all
            </Button>
          )}
        </div>
      </div>
      <div className="p-1.5 space-y-0.5 bg-[hsl(0,0%,10%)]">
        {commands.map((cmd, i) => (
          <div key={i} className="flex items-center gap-2 group px-2 py-1 rounded-sm hover:bg-[hsl(0,0%,13%)]">
            <code className="flex-1 text-[13px] font-mono text-emerald-400/90 leading-snug">{cmd.command}</code>
            <StatusDot status={cmd.status} />
            {cmd.status === 'pending' && isConnected && (
              <button className="text-[10px] text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded-sm hover:bg-[hsl(0,0%,18%)]" onClick={() => onExecute(i)}>
                Run
              </button>
            )}
          </div>
        ))}
      </div>
      {commands.some(c => c.response) && (
        <div className="border-t border-border p-2 bg-[hsl(0,0%,10%)] space-y-0.5">
          {commands.filter(c => c.response).map((cmd, i) => (
            <div key={i} className="text-[11px] font-mono text-muted-foreground px-2 leading-relaxed">
              <span className="text-emerald-500/70">{'\u279C'}</span> {cmd.command}: <span className={cmd.status === 'error' ? 'text-red-400' : 'text-foreground/70'}>{cmd.response}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── File Block ──

function FileBlock({
  files, onCreateFile, onCreateAll, hasServerDir,
}: {
  files: ParsedFileAction[]
  onCreateFile: (index: number) => void
  onCreateAll: () => void
  hasServerDir: boolean
}) {
  const hasPending = files.some(f => f.status === 'pending')

  return (
    <div className="my-3 rounded-md border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[hsl(210,15%,12%)] border-b border-border">
        <span className="text-[11px] font-medium text-blue-400/80 tracking-wide uppercase">
          Files to Create
        </span>
        <div className="flex items-center gap-2">
          {!hasServerDir && <span className="text-[10px] text-amber-500/80">Set server dir</span>}
          {hasPending && hasServerDir && (
            <Button size="sm" className="h-5 text-[10px] px-2 rounded-sm bg-blue-600/80 hover:bg-blue-600" onClick={onCreateAll}>
              Create all
            </Button>
          )}
        </div>
      </div>
      <div className="divide-y divide-border/50">
        {files.map((file, i) => (
          <div key={i} className="bg-[hsl(0,0%,10%)]">
            <div className="flex items-center gap-2 px-3 py-1.5 group">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-blue-400/60">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <code className="flex-1 text-[12px] font-mono text-blue-300/80 truncate">{file.path}</code>
              <StatusDot status={file.status === 'creating' ? 'executing' : file.status} />
              {file.status === 'pending' && hasServerDir && (
                <button className="text-[10px] text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded-sm hover:bg-[hsl(0,0%,18%)]" onClick={() => onCreateFile(i)}>
                  Create
                </button>
              )}
            </div>
            <pre className="px-3 pb-2 overflow-x-auto">
              <code className="text-[12px] font-mono text-foreground/70 leading-relaxed whitespace-pre">{file.content.length > 600 ? file.content.slice(0, 600) + '\n...' : file.content}</code>
            </pre>
            {file.error && (
              <div className="px-3 pb-2 text-[10px] text-red-400">{file.error}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Status dot ──

function StatusDot({ status }: { status: string }) {
  switch (status) {
    case 'pending': return null
    case 'executing': return <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
    case 'creating': return <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
    case 'success': return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
    case 'error': return <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
    default: return null
  }
}

// ── Content renderer ──

function renderContent(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const segments = content.split(/(```(?:minecraft|file:\S+)\n[\s\S]*?```)/g)

  segments.forEach((segment, i) => {
    if (segment.startsWith('```minecraft') || segment.startsWith('```file:')) return

    const codeBlockSegments = segment.split(/(```[\w]*\n[\s\S]*?```)/g)
    codeBlockSegments.forEach((sub, j) => {
      if (sub.startsWith('```')) {
        const langMatch = sub.match(/```(\w*)\n/)
        const code = sub.replace(/```\w*\n/, '').replace(/```$/, '')
        parts.push(
          <pre key={`${i}-${j}`} className="my-2 px-3 py-2 rounded-md bg-[hsl(0,0%,10%)] border border-border overflow-x-auto">
            {langMatch?.[1] && <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{langMatch[1]}</div>}
            <code className="text-[13px] font-mono text-foreground/90 leading-relaxed">{code}</code>
          </pre>
        )
      } else {
        const lines = sub.split('\n')
        lines.forEach((line, k) => {
          if (line.trim() === '') { parts.push(<br key={`${i}-${j}-${k}`} />); return }
          let processed: React.ReactNode = line
          const boldParts = line.split(/(\*\*.*?\*\*)/g)
          if (boldParts.length > 1) {
            processed = boldParts.map((part, m) => {
              if (part.startsWith('**') && part.endsWith('**')) return <strong key={m} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
              return renderInlineCode(part, m)
            })
          } else {
            processed = renderInlineCode(line, 0)
          }
          parts.push(<span key={`${i}-${j}-${k}`}>{processed}{k < lines.length - 1 ? '\n' : ''}</span>)
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
      return <code key={`${key}-${i}`} className="px-1 py-0.5 rounded-[3px] bg-[hsl(0,0%,15%)] text-[13px] font-mono text-emerald-400/80">{part.slice(1, -1)}</code>
    }
    return part
  })
}

// ── Main component ──

export function ChatMessageComponent({
  message, onExecuteCommand, onExecuteAll, onCreateFile, onCreateAllFiles, isConnected, hasServerDir,
}: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`px-5 py-4 ${isUser ? '' : 'bg-[hsl(0,0%,11%)]'}`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[11px] font-medium tracking-wide ${isUser ? 'text-muted-foreground' : 'text-emerald-400/80'}`}>
            {isUser ? 'You' : 'PixelElectron'}
          </span>
        </div>
        <div className="text-[14px] leading-[1.7] text-foreground/90 whitespace-pre-wrap break-words">
          {renderContent(message.content)}
        </div>
        {message.files && message.files.length > 0 && (
          <FileBlock
            files={message.files}
            onCreateFile={onCreateFile}
            onCreateAll={onCreateAllFiles}
            hasServerDir={hasServerDir}
          />
        )}
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
