import { app, BrowserWindow, ipcMain } from 'electron'
import { Rcon } from 'rcon-client'
import path from 'node:path'

process.env.DIST_ELECTRON = path.join(__dirname)
process.env.DIST = path.join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

let win: BrowserWindow | null = null
let rconClient: Rcon | null = null
let mcBot: any = null
let viewerServer: any = null
const viewerPort = 3007

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    title: 'PixelElectron',
    ...(process.platform === 'darwin' ? {
      titleBarStyle: 'hiddenInset' as const,
      trafficLightPosition: { x: 14, y: 14 },
    } : {}),
    backgroundColor: '#191919',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST!, 'index.html'))
  }
}

// RCON handlers
ipcMain.handle('rcon:connect', async (_event, config: { host: string; port: number; password: string }) => {
  try {
    if (rconClient) {
      try { await rconClient.end() } catch { /* ignore */ }
      rconClient = null
    }
    rconClient = await Rcon.connect({
      host: config.host,
      port: config.port,
      password: config.password,
    })
    rconClient.on('error', () => { rconClient = null })
    rconClient.on('end', () => { rconClient = null })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Connection failed' }
  }
})

ipcMain.handle('rcon:send', async (_event, command: string) => {
  if (!rconClient) {
    return { success: false, error: 'Not connected to server' }
  }
  try {
    const cleanCommand = command.startsWith('/') ? command.slice(1) : command
    const response = await rconClient.send(cleanCommand)
    return { success: true, response }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Command failed' }
  }
})

ipcMain.handle('rcon:disconnect', async () => {
  if (rconClient) {
    try { await rconClient.end() } catch { /* ignore */ }
    rconClient = null
  }
  return { success: true }
})

// Bot/Viewer handlers
ipcMain.handle('bot:connect', async (_event, config: { host: string; port: number; username: string }) => {
  try {
    if (mcBot) {
      try { mcBot.end() } catch { /* ignore */ }
      mcBot = null
    }
    if (viewerServer) {
      try { viewerServer.close() } catch { /* ignore */ }
      viewerServer = null
    }

    const mineflayer = await import('mineflayer')
    const prismarineViewer = await import('prismarine-viewer')

    mcBot = mineflayer.createBot({
      host: config.host,
      port: config.port,
      username: config.username,
      auth: 'offline',
    })

    return new Promise((resolve) => {
      mcBot.once('spawn', () => {
        try {
          const viewerModule = prismarineViewer as any
          const mineflayerViewer = viewerModule.mineflayer || viewerModule.default?.mineflayer || viewerModule
          if (mineflayerViewer && typeof mineflayerViewer === 'function') {
            mineflayerViewer(mcBot, { port: viewerPort, firstPerson: true })
          } else if (mineflayerViewer?.mineflayer) {
            mineflayerViewer.mineflayer(mcBot, { port: viewerPort, firstPerson: true })
          }
        } catch (e: any) {
          console.error('Viewer setup error:', e.message)
        }
        resolve({ success: true, viewerPort })
      })

      mcBot.once('error', (err: any) => {
        resolve({ success: false, error: err?.message || 'Bot connection failed' })
      })

      mcBot.once('kicked', (reason: any) => {
        resolve({ success: false, error: `Kicked: ${typeof reason === 'string' ? reason : JSON.stringify(reason)}` })
      })

      setTimeout(() => {
        resolve({ success: false, error: 'Connection timed out' })
      }, 15000)
    })
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to create bot' }
  }
})

ipcMain.handle('bot:disconnect', async () => {
  if (mcBot) {
    try { mcBot.end() } catch { /* ignore */ }
    mcBot = null
  }
  if (viewerServer) {
    try { viewerServer.close() } catch { /* ignore */ }
    viewerServer = null
  }
  return { success: true }
})

ipcMain.handle('bot:status', () => {
  return {
    connected: mcBot !== null && mcBot.entity !== undefined,
    viewerPort,
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (rconClient) {
    try { rconClient.end() } catch { /* ignore */ }
    rconClient = null
  }
  if (mcBot) {
    try { mcBot.end() } catch { /* ignore */ }
    mcBot = null
  }
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
