# AGENTS.md

## Cursor Cloud specific instructions

### Overview

PixelElectron is an Electron desktop app ("Cursor for Minecraft") built with React, Vite, TypeScript, Tailwind CSS v3, and shadcn/ui. It connects to Minecraft servers via RCON and uses OpenRouter (free models) for AI chat. It can create files on the server filesystem (datapacks, plugin configs) and embed a live Minecraft viewport via mineflayer + prismarine-viewer.

### Running the app

- `npm run dev` starts Vite dev server + Electron automatically.
- `npm run build` builds renderer (`dist/`) and electron (`dist-electron/`).
- `npm run lint` runs ESLint v9.
- `DISPLAY=:1` is required for the Electron window; pre-configured in the cloud VM.
- dbus errors in console are expected/harmless in headless environments.

### Key conventions

- **No Lucide React**: Use inline SVGs or unicode for icons.
- **shadcn/ui only**: Add components via `npx shadcn@latest add <component>`.
- **Tailwind CSS v3**: Not v4. Required for shadcn.
- **Node.js**: Latest LTS via nvm (v24.x).
- **Free AI models**: All use `:free` suffix. Default is `mistralai/mistral-small-3.1-24b-instruct:free`. Auto-fallback across models when rate-limited (20 req/min, 200 req/day per model).
- **Falcraft**: `/fal generate <size> <prompt>` and `/fal stream <size> <prompt>` via RCON.
- **RCON vs Bot**: RCON (25575) for admin commands. Bot (25565) for viewport.

### Environment variables

- `OPENROUTER_API_KEY`: Auto-injected via IPC on startup.

### Build gotchas

- `mineflayer` and `prismarine-viewer` must be in `build.rollupOptions.external` or the build OOMs.
- Preload script compiles to `preload.js` (not `.mjs`). The main process must reference `preload.js`.
- Preload cannot access `process.env` directly; use `ipcMain.handle` + `ipcRenderer.invoke`.
