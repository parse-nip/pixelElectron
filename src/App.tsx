import { useState, useCallback, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ChatPanel } from '@/components/ChatPanel'
import { MinecraftViewport } from '@/components/MinecraftViewport'
import { SettingsDialog } from '@/components/SettingsDialog'
import { useChat } from '@/hooks/useChat'
import type { AppSettings, ServerConfig, BotConfig } from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  model: 'mistralai/mistral-small-3.1-24b-instruct:free',
  serverConfig: {
    host: 'localhost',
    port: 25575,
    password: '',
  },
  botConfig: {
    host: 'localhost',
    port: 25565,
    username: 'PixelBot',
  },
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

  // RCON state
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Bot state
  const [isBotConnected, setIsBotConnected] = useState(false)
  const [isBotConnecting, setIsBotConnecting] = useState(false)
  const [botError, setBotError] = useState<string | null>(null)
  const [viewerPort, setViewerPort] = useState<number | null>(null)

  const {
    messages, isLoading, error,
    sendMessage, executeCommand, executeAllCommands,
    createFile, createAllFiles, clearMessages,
  } = useChat(settings.apiKey, settings.model, settings.serverDir)

  useEffect(() => {
    if (!settings.apiKey && window.electronAPI?.getEnvApiKey) {
      window.electronAPI.getEnvApiKey().then((key: string) => {
        if (key) setSettings(prev => ({ ...prev, apiKey: key }))
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { saveSettings(settings) }, [settings])

  const handleSettingsChange = useCallback((s: AppSettings) => setSettings(s), [])
  const handleServerConfigChange = useCallback((config: ServerConfig) => {
    setSettings(prev => ({ ...prev, serverConfig: config }))
  }, [])
  const handleBotConfigChange = useCallback((config: BotConfig) => {
    setSettings(prev => ({ ...prev, botConfig: config }))
  }, [])
  const handleServerDirChange = useCallback((dir: string) => {
    setSettings(prev => ({ ...prev, serverDir: dir }))
  }, [])

  const handleConnect = useCallback(async () => {
    const api = window.electronAPI
    if (!api) { setConnectionError('RCON not available (browser mode)'); return }
    setIsConnecting(true)
    setConnectionError(null)
    const result = await api.rcon.connect(settings.serverConfig)
    if (result.success) { setIsConnected(true) } else { setConnectionError(result.error || 'Failed') }
    setIsConnecting(false)
  }, [settings.serverConfig])

  const handleDisconnect = useCallback(async () => {
    const api = window.electronAPI
    if (api) await api.rcon.disconnect()
    setIsConnected(false)
    setConnectionError(null)
  }, [])

  const handleBotConnect = useCallback(async () => {
    const api = window.electronAPI
    if (!api) { setBotError('Not available in browser mode'); return }
    setIsBotConnecting(true)
    setBotError(null)
    const result = await api.bot.connect(settings.botConfig)
    if (result.success) {
      setIsBotConnected(true)
      setViewerPort(result.viewerPort || null)
      setActiveView('viewport')
    } else {
      setBotError(result.error || 'Failed')
    }
    setIsBotConnecting(false)
  }, [settings.botConfig])

  const handleBotDisconnect = useCallback(async () => {
    const api = window.electronAPI
    if (api) await api.bot.disconnect()
    setIsBotConnected(false)
    setViewerPort(null)
    setBotError(null)
  }, [])

  const chatPanelProps = {
    messages,
    isLoading,
    error,
    isConnected,
    hasServerDir: !!settings.serverDir,
    onSendMessage: sendMessage,
    onExecuteCommand: executeCommand,
    onExecuteAll: executeAllCommands,
    onCreateFile: createFile,
    onCreateAllFiles: createAllFiles,
    onClear: clearMessages,
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0 border-r border-border/40 bg-[hsl(0,0%,11%)]">
        <Sidebar
          serverConfig={settings.serverConfig}
          onServerConfigChange={handleServerConfigChange}
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

      {/* Main content */}
      <div className="flex-1 flex min-w-0">
        {activeView === 'chat' ? (
          <div className="flex-1 min-w-0">
            <ChatPanel {...chatPanelProps} />
          </div>
        ) : (
          <div className="flex-1 flex">
            <div className="flex-1 min-w-0">
              <MinecraftViewport
                botConfig={settings.botConfig}
                onBotConfigChange={handleBotConfigChange}
                isBotConnected={isBotConnected}
                isBotConnecting={isBotConnecting}
                botError={botError}
                viewerPort={viewerPort}
                onBotConnect={handleBotConnect}
                onBotDisconnect={handleBotDisconnect}
              />
            </div>
            <div className="w-[380px] flex-shrink-0 border-l border-border/40">
              <ChatPanel {...chatPanelProps} />
            </div>
          </div>
        )}
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}
