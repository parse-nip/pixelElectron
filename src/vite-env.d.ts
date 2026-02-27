/// <reference types="vite/client" />

interface ElectronAPI {
  rcon: {
    connect: (config: { host: string; port: number; password: string }) => Promise<{ success: boolean; error?: string }>;
    send: (command: string) => Promise<{ success: boolean; response?: string; error?: string }>;
    disconnect: () => Promise<{ success: boolean }>;
  };
}

interface Window {
  electronAPI?: ElectronAPI;
}
