const API_BASE = 'https://api.minehut.com'

export interface MinehutConfig {
  authToken: string
  sessionId: string
  serverId: string
  serverName: string
}

interface MinehutServer {
  _id: string
  name: string
  online: boolean
  playerCount: number
  maxPlayers: number
  plan: string
}

function headers(config: MinehutConfig) {
  return {
    'Content-Type': 'application/json',
    'Authorization': config.authToken,
    'x-session-id': config.sessionId,
  }
}

export async function minehutSendCommand(
  config: MinehutConfig,
  command: string,
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const cleanCommand = command.startsWith('/') ? command.slice(1) : command
    const res = await fetch(`${API_BASE}/server/${config.serverId}/send_command`, {
      method: 'POST',
      headers: headers(config),
      body: JSON.stringify({ command: cleanCommand }),
    })

    if (!res.ok) {
      const text = await res.text()
      return { success: false, error: `Minehut API error (${res.status}): ${text}` }
    }

    return { success: true, response: `Command sent: /${cleanCommand}` }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to send command' }
  }
}

export async function minehutGetServer(
  config: MinehutConfig,
): Promise<{ success: boolean; server?: MinehutServer; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/server/${config.serverId}`, {
      headers: headers(config),
    })

    if (!res.ok) {
      return { success: false, error: `Failed to get server info (${res.status})` }
    }

    const data = await res.json()
    return { success: true, server: data.server }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to get server' }
  }
}

export async function minehutStartServer(
  config: MinehutConfig,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/server/${config.serverId}/start`, {
      method: 'POST',
      headers: headers(config),
    })
    if (!res.ok) {
      return { success: false, error: `Failed to start (${res.status})` }
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error?.message }
  }
}

export async function minehutStopServer(
  config: MinehutConfig,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/server/${config.serverId}/stop`, {
      method: 'POST',
      headers: headers(config),
    })
    if (!res.ok) {
      return { success: false, error: `Failed to stop (${res.status})` }
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error?.message }
  }
}

export async function minehutListServers(
  authToken: string,
  sessionId: string,
): Promise<{ success: boolean; servers?: { _id: string; name: string }[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/servers`, {
      headers: {
        'Authorization': authToken,
        'x-session-id': sessionId,
      },
    })
    if (!res.ok) {
      return { success: false, error: `Failed to list servers (${res.status})` }
    }
    const data = await res.json()
    return { success: true, servers: data.servers || [] }
  } catch (error: any) {
    return { success: false, error: error?.message }
  }
}

export async function minehutInstallPlugin(
  config: MinehutConfig,
  pluginId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/server/${config.serverId}/install_plugin`, {
      method: 'POST',
      headers: headers(config),
      body: JSON.stringify({ plugin: pluginId }),
    })
    if (!res.ok) {
      return { success: false, error: `Failed to install plugin (${res.status})` }
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error?.message }
  }
}
