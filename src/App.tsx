import { useState, useCallback, useEffect } from 'react'
import { ChatPanel } from '@/components/ChatPanel'
import { ServerPanel } from '@/components/ServerPanel'
import { SettingsDialog } from '@/components/SettingsDialog'
import { useChat } from '@/hooks/useChat'
import type { AppSettings, ServerConfig } from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  model: 'google/gemini-2.0-flash-001',
  serverConfig: {
    host: 'localhost',
    port: 25575,
    password: '',
  },
}

function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem('pixelelectron-settings')
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    }
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS
}

function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem('pixelelectron-settings', JSON.stringify(settings))
  } catch { /* ignore */ }
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    executeCommand,
    executeAllCommands,
    clearMessages,
  } = useChat(settings.apiKey, settings.model)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings)
  }, [])

  const handleServerConfigChange = useCallback((config: ServerConfig) => {
    setSettings(prev => ({ ...prev, serverConfig: config }))
  }, [])

  const handleConnect = useCallback(async () => {
    const api = window.electronAPI
    if (!api) {
      setConnectionError('RCON not available (running in browser mode)')
      return
    }

    setIsConnecting(true)
    setConnectionError(null)

    const result = await api.rcon.connect(settings.serverConfig)
    if (result.success) {
      setIsConnected(true)
    } else {
      setConnectionError(result.error || 'Connection failed')
    }
    setIsConnecting(false)
  }, [settings.serverConfig])

  const handleDisconnect = useCallback(async () => {
    const api = window.electronAPI
    if (api) {
      await api.rcon.disconnect()
    }
    setIsConnected(false)
    setConnectionError(null)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-border bg-card">
        <ServerPanel
          serverConfig={settings.serverConfig}
          onServerConfigChange={handleServerConfigChange}
          isConnected={isConnected}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          isConnecting={isConnecting}
          connectionError={connectionError}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          error={error}
          isConnected={isConnected}
          onSendMessage={sendMessage}
          onExecuteCommand={executeCommand}
          onExecuteAll={executeAllCommands}
          onClear={clearMessages}
        />
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}
