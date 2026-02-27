import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ServerConfig } from '@/types'

interface SidebarProps {
  serverConfig: ServerConfig
  onServerConfigChange: (config: ServerConfig) => void
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
  isConnecting: boolean
  connectionError: string | null
  onOpenSettings: () => void
  activeView: 'chat' | 'viewport'
  onViewChange: (view: 'chat' | 'viewport') => void
}

export function Sidebar({
  serverConfig,
  onServerConfigChange,
  isConnected,
  onConnect,
  onDisconnect,
  isConnecting,
  connectionError,
  onOpenSettings,
  activeView,
  onViewChange,
}: SidebarProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="flex flex-col h-full select-none">
      {/* Logo area - with drag region for macOS */}
      <div className="h-11 flex items-center px-4 flex-shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div className="flex items-center gap-2 pl-14" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <div className="w-5 h-5 rounded-[4px] bg-emerald-600 flex items-center justify-center">
            <span className="text-white text-[9px] font-black">PE</span>
          </div>
          <span className="text-[13px] font-semibold text-foreground/90">PixelElectron</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-2 py-1">
        <NavItem
          label="Chat"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
          active={activeView === 'chat'}
          onClick={() => onViewChange('chat')}
        />
        <NavItem
          label="Viewport"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          }
          active={activeView === 'viewport'}
          onClick={() => onViewChange('viewport')}
        />
      </div>

      {/* Divider */}
      <div className="mx-3 my-1 h-px bg-border/50" />

      {/* RCON Server */}
      <div className="px-3 py-2">
        <button
          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground/80 transition-colors mb-2 w-full"
          onClick={() => setExpanded(!expanded)}
        >
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="tracking-wide uppercase">RCON Server</span>
          <span className={`ml-auto w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
        </button>

        {expanded && (
          <div className="space-y-1.5 pl-3">
            <Input
              placeholder="Host"
              value={serverConfig.host}
              onChange={(e) => onServerConfigChange({ ...serverConfig, host: e.target.value })}
              className="h-7 text-[11px] bg-transparent border-border/40 focus:border-border px-2"
              disabled={isConnected}
            />
            <div className="flex gap-1.5">
              <Input
                placeholder="Port"
                type="number"
                value={serverConfig.port || ''}
                onChange={(e) => onServerConfigChange({ ...serverConfig, port: parseInt(e.target.value) || 25575 })}
                className="h-7 text-[11px] bg-transparent border-border/40 focus:border-border px-2 w-16"
                disabled={isConnected}
              />
              <Input
                placeholder="Password"
                type="password"
                value={serverConfig.password}
                onChange={(e) => onServerConfigChange({ ...serverConfig, password: e.target.value })}
                className="h-7 text-[11px] bg-transparent border-border/40 focus:border-border px-2 flex-1"
                disabled={isConnected}
              />
            </div>

            {connectionError && (
              <p className="text-[10px] text-red-400/90 leading-snug">{connectionError}</p>
            )}

            <Button
              onClick={isConnected ? onDisconnect : onConnect}
              variant={isConnected ? 'outline' : 'default'}
              size="sm"
              className="w-full h-7 text-[11px]"
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom settings */}
      <div className="px-2 py-2 border-t border-border/30">
        <NavItem
          label="Settings"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          }
          active={false}
          onClick={onOpenSettings}
        />
      </div>
    </div>
  )
}

function NavItem({ label, icon, active, onClick }: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
        active
          ? 'bg-accent text-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
      }`}
    >
      <span className="opacity-70">{icon}</span>
      {label}
    </button>
  )
}
