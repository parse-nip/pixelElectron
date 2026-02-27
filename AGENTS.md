# AGENTS.md

## Cursor Cloud specific instructions

### Overview

PixelElectron is an Electron desktop app ("Cursor for Minecraft") built with React, Vite, TypeScript, Tailwind CSS v3, and shadcn/ui. It connects to Minecraft servers via RCON and uses OpenRouter (free models) for AI chat. It can also embed a live Minecraft viewport via mineflayer + prismarine-viewer.

### Running the app

- `npm run dev` starts the Vite dev server and launches Electron automatically (via `vite-plugin-electron`).
- `npm run build` builds both the renderer (to `dist/`) and electron (to `dist-electron/`).
- `npm run lint` runs ESLint v9 (flat config) on `src/` and `electron/`.
- A `DISPLAY` environment variable is required for Electron to open its window. The cloud VM has `:1` pre-configured.
- dbus errors in the console output are expected and harmless in headless environments.

### Key conventions

- **No Lucide React**: User rule prohibits `lucide-react`. Use inline SVGs or unicode. The dialog component uses an inline SVG X icon.
- **shadcn/ui only**: Use `npx shadcn@latest add <component>` to add UI components.
- **Tailwind CSS v3**: Not v4. Required for shadcn compatibility.
- **Node.js**: Use latest LTS via nvm (currently v24.x).
- **Free AI models**: All models use the `:free` suffix on OpenRouter. The default model is `mistralai/mistral-small-3.1-24b-instruct:free`. Free models have rate limits (20 req/min, 200 req/day per model). If one model is rate-limited, try another.
- **Falcraft**: AI building uses `/fal generate <size> <prompt>` and `/fal stream <size> <prompt>` via RCON. Requires the Falcraft Fabric mod + fal.ai API key on the server.
- **Minecraft Viewport**: Uses mineflayer (bot) + prismarine-viewer (3D renderer). These are externalized in the Vite build config due to size.
- **RCON vs Bot**: RCON (port 25575) is for server commands. Bot (port 25565) is for game-level interaction and the viewport.

### Environment variables

- `OPENROUTER_API_KEY`: Auto-injected into the app on startup via IPC (`main process -> preload -> renderer`). If set, the user doesn't need to manually enter it in Settings.

### Build gotchas

- `mineflayer` and `prismarine-viewer` must be listed in `build.rollupOptions.external` in the Vite electron config, otherwise the build runs out of memory.
- The main process uses dynamic `import()` for these modules so they resolve at runtime from `node_modules`.
- The preload script cannot access `process.env` directly due to context isolation. Environment variables must be exposed via `ipcMain.handle` in the main process and `ipcRenderer.invoke` in the preload.
