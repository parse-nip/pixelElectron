import { useState, useCallback, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ChatPanel } from '@/components/ChatPanel'
import { MinecraftViewport } from '@/components/MinecraftViewport'
import { SettingsDialog } from '@/components/SettingsDialog'
import { useChat } from '@/hooks/useChat'
import { minehutSendCommand, minehutGetServer } from '@/lib/minehut'
import type { AppSettings, ServerConfig, BotConfig, MinehutConfig } from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  model: 'mistralai/mistral-small-3.1-24b-instruct:free',
  connectionMode: 'rcon',
  serverConfig: { host: 'localhost', port: 25575, password: '' },
  botConfig: { host: 'localhost', port: 25565, username: 'PixelBot' },
  minehutConfig: { authToken: '', sessionId: '', serverId: '', serverName: '' },
  serverDir: '',
}

function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem('pixelelectron-settings')
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS }
}

function saveSettings(settings: AppSettings) {
  try { localStorage.setItem('pixelelectron-settings', JSON.stringify(settings)) } catch { /* ignore */ }
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeView, setActiveView] = useState<'chat' | 'viewport'>('chat')

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const [isBotConnected, setIsBotConnected] = useState(false)
  const [isBotConnecting, setIsBotConnecting] = useState(false)
  const [botError, setBotError] = useState<string | null>(null)
  const [viewerPort, setViewerPort] = useState<number | null>(null)

  const commandSender = useCallback(async (command: string) => {
    if (settings.connectionMode === 'minehut') {
      return minehutSendCommand(settings.minehutConfig, command)
    }
    const api = window.electronAPI
    if (!api) return { success: false, error: 'RCON not available' }
    return api.rcon.send(command)
  }, [settings.connectionMode, settings.minehutConfig])

  const {
    messages, isLoading, error,
    sendMessage, executeCommand, executeAllCommands,
    createFile, createAllFiles, clearMessages,
  } = useChat(settings.apiKey, settings.model, settings.serverDir, commandSender)

  useEffect(() => {
    if (!settings.apiKey && window.electronAPI?.getEnvApiKey) {
      window.electronAPI.getEnvApiKey().then((key: string) => {
        if (key) setSettings(prev => ({ ...prev, apiKey: key }))
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { saveSettings(settings) }, [settings])

  // -- Connection handlers --

  const handleConnect = useCallback(async () => {
    setIsConnecting(true)
    setConnectionError(null)

    if (settings.connectionMode === 'minehut') {
      const cfg = settings.minehutConfig
      if (!cfg.authToken || !cfg.sessionId || !cfg.serverId) {
        setConnectionError('Fill in Auth Token, Session ID, and Server ID')
        setIsConnecting(false)
        return
      }
      const result = await minehutGetServer(cfg)
      if (result.success) {
        setIsConnected(true)
        if (result.server?.name) {
          setSettings(prev => ({ ...prev, minehutConfig: { ...prev.minehutConfig, serverName: result.server!.name } }))
        }
      } else {
        setConnectionError(result.error || 'Failed to connect to Minehut')
      }
    } else {
      const api = window.electronAPI
      if (!api) { setConnectionError('RCON not available (browser mode)'); setIsConnecting(false); return }
      const result = await api.rcon.connect(settings.serverConfig)
      if (result.success) { setIsConnected(true) } else { setConnectionError(result.error || 'Failed') }
    }
    setIsConnecting(false)
  }, [settings.connectionMode, settings.serverConfig, settings.minehutConfig])

  const handleDisconnect = useCallback(async () => {
    if (settings.connectionMode === 'rcon') {
      const api = window.electronAPI
      if (api) await api.rcon.disconnect()
    }
    setIsConnected(false)
    setConnectionError(null)
  }, [settings.connectionMode])

  const handleExecuteCommand = executeCommand

  // -- Other handlers --

  const handleSettingsChange = useCallback((s: AppSettings) => setSettings(s), [])
  const handleServerConfigChange = useCallback((config: ServerConfig) => setSettings(prev => ({ ...prev, serverConfig: config })), [])
  const handleMinehutConfigChange = useCallback((config: MinehutConfig) => setSettings(prev => ({ ...prev, minehutConfig: config })), [])
  const handleBotConfigChange = useCallback((config: BotConfig) => setSettings(prev => ({ ...prev, botConfig: config })), [])
  const handleServerDirChange = useCallback((dir: string) => setSettings(prev => ({ ...prev, serverDir: dir })), [])
  const handleConnectionModeChange = useCallback((mode: 'rcon' | 'minehut') => {
    setIsConnected(false)
    setConnectionError(null)
    setSettings(prev => ({ ...prev, connectionMode: mode }))
  }, [])

  const handleBotConnect = useCallback(async () => {
    const api = window.electronAPI
    if (!api) { setBotError('Not available in browser mode'); return }
    setIsBotConnecting(true); setBotError(null)
    const result = await api.bot.connect(settings.botConfig)
    if (result.success) { setIsBotConnected(true); setViewerPort(result.viewerPort || null); setActiveView('viewport') }
    else { setBotError(result.error || 'Failed') }
    setIsBotConnecting(false)
  }, [settings.botConfig])

  const handleBotDisconnect = useCallback(async () => {
    const api = window.electronAPI
    if (api) await api.bot.disconnect()
    setIsBotConnected(false); setViewerPort(null); setBotError(null)
  }, [])

  const chatPanelProps = {
    messages, isLoading, error, isConnected,
    hasServerDir: !!settings.serverDir,
    onSendMessage: sendMessage,
    onExecuteCommand: handleExecuteCommand,
    onExecuteAll: executeAllCommands,
    onCreateFile: createFile,
    onCreateAllFiles: createAllFiles,
    onClear: clearMessages,
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-[220px] flex-shrink-0 border-r border-border/40 bg-[hsl(0,0%,11%)]">
        <Sidebar
          connectionMode={settings.connectionMode}
          onConnectionModeChange={handleConnectionModeChange}
          serverConfig={settings.serverConfig}
          onServerConfigChange={handleServerConfigChange}
          minehutConfig={settings.minehutConfig}
          onMinehutConfigChange={handleMinehutConfigChange}
          serverDir={settings.serverDir}
          onServerDirChange={handleServerDirChange}
          isConnected={isConnected}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          isConnecting={isConnecting}
          connectionError={connectionError}
          onOpenSettings={() => setSettingsOpen(true)}
          activeView={activeView}
          onViewChange={setActiveView}
        />
      </div>

      <div className="flex-1 flex min-w-0">
        {activeView === 'chat' ? (
          <div className="flex-1 min-w-0"><ChatPanel {...chatPanelProps} /></div>
        ) : (
          <div className="flex-1 flex">
            <div className="flex-1 min-w-0">
              <MinecraftViewport botConfig={settings.botConfig} onBotConfigChange={handleBotConfigChange} isBotConnected={isBotConnected} isBotConnecting={isBotConnecting} botError={botError} viewerPort={viewerPort} onBotConnect={handleBotConnect} onBotDisconnect={handleBotDisconnect} />
            </div>
            <div className="w-[380px] flex-shrink-0 border-l border-border/40"><ChatPanel {...chatPanelProps} /></div>
          </div>
        )}
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onSettingsChange={handleSettingsChange} />
    </div>
  )
}
