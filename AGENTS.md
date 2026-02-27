# AGENTS.md

## Cursor Cloud specific instructions

### Repository Status

This repository (`pixelElectron`) is currently empty — it contains only a `README.md` with the project title. No source code, dependencies, build configuration, or application logic exists yet.

### Environment

- **Node.js**: v24.13.1 (LTS Krypton) is installed via nvm and set as default.
- **npm**: v11.8.0 is available.
- **No package manager lockfile** exists, so no dependency installation is needed until code is committed.

### Notes for Future Agents

- The project name suggests an Electron-based application. When code is added, expect to need Electron, possibly with a frontend framework (React/Vue/etc.).
- There is no `package.json` yet. Once one is committed, the update script should be updated to run the appropriate install command (`npm install`, `pnpm install`, etc.) based on the lockfile present.
- User rules specify: use shadcn/ui components, never use Lucide React icons, and always switch to the latest Node.js version available.
