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

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'PixelElectron - Cursor for Minecraft',
    backgroundColor: '#09090b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(process.env.DIST!, 'index.html'))
  }
}

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
    rconClient.on('error', () => {
      rconClient = null
    })
    rconClient.on('end', () => {
      rconClient = null
    })
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

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (rconClient) {
    try { rconClient.end() } catch { /* ignore */ }
    rconClient = null
  }
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
