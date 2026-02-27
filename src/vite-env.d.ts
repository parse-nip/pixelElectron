/// <reference types="vite/client" />

interface ElectronAPI {
  rcon: {
    connect: (config: { host: string; port: number; password: string }) => Promise<{ success: boolean; error?: string }>;
    send: (command: string) => Promise<{ success: boolean; response?: string; error?: string }>;
    disconnect: () => Promise<{ success: boolean }>;
  };
  bot: {
    connect: (config: { host: string; port: number; username: string }) => Promise<{ success: boolean; viewerPort?: number; error?: string }>;
    disconnect: () => Promise<{ success: boolean }>;
    status: () => Promise<{ connected: boolean; viewerPort: number }>;
  };
  getEnvApiKey: () => string;
}

interface Window {
  electronAPI?: ElectronAPI;
}
