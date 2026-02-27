# AGENTS.md

## Cursor Cloud specific instructions

### Overview

PixelElectron is an Electron desktop app ("Cursor for Minecraft") built with React, Vite, TypeScript, Tailwind CSS v3, and shadcn/ui. It connects to Minecraft servers via RCON and uses OpenRouter for AI chat.

### Running the app

- `npm run dev` starts the Vite dev server and launches Electron automatically (via `vite-plugin-electron`).
- `npm run build` builds both the renderer (to `dist/`) and electron (to `dist-electron/`).
- `npm run lint` runs ESLint v9 (flat config) on `src/` and `electron/`.
- A `DISPLAY` environment variable is required for Electron to open its window. The cloud VM has `:1` pre-configured.
- dbus errors in the console output are expected and harmless in headless environments.

### Key conventions

- **No Lucide React**: The user rule prohibits direct use of `lucide-react`. Use inline SVGs or unicode characters for icons. The shadcn dialog component has been patched to use an inline SVG instead of the Lucide `X` icon.
- **shadcn/ui only**: Always use the CLI (`npx shadcn@latest add <component>`) to add new UI components. Never recreate them manually.
- **Tailwind CSS v3**: This project uses Tailwind v3 (not v4) for compatibility with shadcn.
- **Node.js**: Use the latest LTS version available via nvm. Currently v24.x.
- **OpenRouter API key**: Required for AI chat. Users configure it in the Settings dialog. The `OPENROUTER_API_KEY` secret can be used for automated testing.
- **RCON**: The Electron main process manages the RCON connection. The renderer communicates via IPC (`window.electronAPI.rcon`). A running Minecraft server is needed for RCON to work.
