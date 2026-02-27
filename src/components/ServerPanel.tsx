import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { ServerConfig } from '@/types'

interface ServerPanelProps {
  serverConfig: ServerConfig
  onServerConfigChange: (config: ServerConfig) => void
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
  isConnecting: boolean
  connectionError: string | null
  onOpenSettings: () => void
}

export function ServerPanel({
  serverConfig,
  onServerConfigChange,
  isConnected,
  onConnect,
  onDisconnect,
  isConnecting,
  connectionError,
  onOpenSettings,
}: ServerPanelProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Logo/Title */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-black">PE</span>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">PixelElectron</h1>
            <p className="text-[10px] text-muted-foreground">Cursor for Minecraft</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Server Connection */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Server
          </span>
          <Badge variant={isConnected ? 'default' : 'secondary'} className="text-[10px] h-5">
            {isConnected ? 'Connected' : 'Offline'}
          </Badge>
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Host (e.g. localhost)"
            value={serverConfig.host}
            onChange={(e) => onServerConfigChange({ ...serverConfig, host: e.target.value })}
            className="h-8 text-xs"
            disabled={isConnected}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Port"
              type="number"
              value={serverConfig.port || ''}
              onChange={(e) => onServerConfigChange({ ...serverConfig, port: parseInt(e.target.value) || 25575 })}
              className="h-8 text-xs w-24"
              disabled={isConnected}
            />
            <div className="relative flex-1">
              <Input
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                value={serverConfig.password}
                onChange={(e) => onServerConfigChange({ ...serverConfig, password: e.target.value })}
                className="h-8 text-xs pr-10"
                disabled={isConnected}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {connectionError && (
            <p className="text-xs text-destructive">{connectionError}</p>
          )}

          <Button
            onClick={isConnected ? onDisconnect : onConnect}
            variant={isConnected ? 'outline' : 'default'}
            size="sm"
            className="w-full h-8 text-xs"
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="px-4 py-3 flex-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">
          Capabilities
        </span>
        <div className="space-y-1">
          {CAPABILITIES.map((cap, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground">
              <span className="w-4 text-center text-[10px]">{cap.icon}</span>
              <span>{cap.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Settings */}
      <div className="px-4 py-3">
        <Button variant="ghost" size="sm" className="w-full h-8 text-xs justify-start" onClick={onOpenSettings}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          Settings
        </Button>
      </div>
    </div>
  )
}

const CAPABILITIES = [
  { icon: '&#x2692;', label: 'Build structures' },
  { icon: '&#x2655;', label: 'Create ranks' },
  { icon: '&#x2318;', label: 'Custom commands' },
  { icon: '&#x2694;', label: 'Minigames & arenas' },
  { icon: '&#x1F511;', label: 'LuckPerms setup' },
  { icon: '&#x1F381;', label: 'Crates & rewards' },
  { icon: '&#x1F6E1;', label: 'WorldGuard regions' },
]
