import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BotConfig } from '@/types'

interface MinecraftViewportProps {
  botConfig: BotConfig
  onBotConfigChange: (config: BotConfig) => void
  isBotConnected: boolean
  isBotConnecting: boolean
  botError: string | null
  viewerPort: number | null
  onBotConnect: () => void
  onBotDisconnect: () => void
}

export function MinecraftViewport({
  botConfig,
  onBotConfigChange,
  isBotConnected,
  isBotConnecting,
  botError,
  viewerPort,
  onBotConnect,
  onBotDisconnect,
}: MinecraftViewportProps) {
  const [showConnect, setShowConnect] = useState(false)

  if (isBotConnected && viewerPort) {
    return (
      <div className="h-full w-full relative bg-black">
        <iframe
          src={`http://localhost:${viewerPort}`}
          className="w-full h-full border-0"
          title="Minecraft Viewport"
          sandbox="allow-scripts allow-same-origin"
        />
        <div className="absolute bottom-3 right-3">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px] bg-black/60 border-white/10 hover:bg-black/80 text-white backdrop-blur-sm"
            onClick={onBotDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-[hsl(0,0%,8%)] relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `
          linear-gradient(hsl(0,0%,50%) 1px, transparent 1px),
          linear-gradient(90deg, hsl(0,0%,50%) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
      }} />

      <div className="relative z-10 text-center max-w-sm px-6">
        {!showConnect ? (
          <>
            <div className="mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto opacity-20">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h3 className="text-[14px] font-medium text-foreground/70 mb-1">Minecraft Viewport</h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-5">
              Connect a bot to view your server world in real-time using prismarine-viewer.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[12px] px-4 border-border/50 hover:border-border"
              onClick={() => setShowConnect(true)}
            >
              Connect Bot
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-[13px] font-medium text-foreground/70 mb-3">Connect to Server</h3>
            <div className="space-y-2 text-left">
              <Input
                placeholder="Server host (e.g. localhost)"
                value={botConfig.host}
                onChange={(e) => onBotConfigChange({ ...botConfig, host: e.target.value })}
                className="h-8 text-[12px] bg-[hsl(0,0%,12%)] border-border/50"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Port"
                  type="number"
                  value={botConfig.port || ''}
                  onChange={(e) => onBotConfigChange({ ...botConfig, port: parseInt(e.target.value) || 25565 })}
                  className="h-8 text-[12px] bg-[hsl(0,0%,12%)] border-border/50 w-24"
                />
                <Input
                  placeholder="Bot username"
                  value={botConfig.username}
                  onChange={(e) => onBotConfigChange({ ...botConfig, username: e.target.value })}
                  className="h-8 text-[12px] bg-[hsl(0,0%,12%)] border-border/50 flex-1"
                />
              </div>

              {botError && (
                <p className="text-[11px] text-red-400 py-1">{botError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] flex-1"
                  onClick={() => setShowConnect(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-[11px] flex-1"
                  onClick={onBotConnect}
                  disabled={isBotConnecting || !botConfig.host || !botConfig.username}
                >
                  {isBotConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
