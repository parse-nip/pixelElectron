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
})
