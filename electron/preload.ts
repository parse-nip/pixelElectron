import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  rcon: {
    connect: (config: { host: string; port: number; password: string }) =>
      ipcRenderer.invoke('rcon:connect', config),
    send: (command: string) =>
      ipcRenderer.invoke('rcon:send', command),
    disconnect: () =>
      ipcRenderer.invoke('rcon:disconnect'),
  },
  bot: {
    connect: (config: { host: string; port: number; username: string }) =>
      ipcRenderer.invoke('bot:connect', config),
    disconnect: () =>
      ipcRenderer.invoke('bot:disconnect'),
    status: () =>
      ipcRenderer.invoke('bot:status'),
  },
  fs: {
    writeFile: (relativePath: string, content: string, serverDir: string) =>
      ipcRenderer.invoke('fs:writeFile', relativePath, content, serverDir),
    readFile: (relativePath: string, serverDir: string) =>
      ipcRenderer.invoke('fs:readFile', relativePath, serverDir),
    exists: (relativePath: string, serverDir: string) =>
      ipcRenderer.invoke('fs:exists', relativePath, serverDir),
  },
  getEnvApiKey: () => ipcRenderer.invoke('get-env-api-key'),
})
