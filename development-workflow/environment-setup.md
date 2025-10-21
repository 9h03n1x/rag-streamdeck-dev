# Environment Setup

## Prerequisites

### Required Software

1. **Node.js 20+**
   - Recommended: Use nvm (Node Version Manager)
   - Minimum version: 20.0.0
   
2. **Stream Deck Application 6.4+**
   - Download from elgato.com
   - Supports Windows 10+ and macOS 10.15+

3. **Stream Deck Device**
   - Physical device or Stream Deck Mobile

4. **Code Editor**
   - VS Code (recommended)
   - WebStorm, Sublime Text, or any editor

5. **Terminal/Command Line**
   - PowerShell (Windows)
   - Terminal (macOS/Linux)

## Node.js Installation

### Using nvm (Recommended)

**macOS/Linux**:
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash

# Install Node.js 20
nvm install 20
nvm use 20

# Verify
node -v  # Should show v20.x.x
```

**Windows**:
```powershell
# Download and install nvm-windows from:
# https://github.com/coreybutler/nvm-windows/releases

# Install Node.js 20
nvm install 20
nvm use 20

# Verify
node -v
```

### Direct Installation

Download from nodejs.org and install Node.js 20 LTS.

## Stream Deck CLI Installation

The Stream Deck CLI provides commands for creating, testing, and packaging plugins.

```bash
# Install globally
npm install -g @elgato/cli

# Verify installation
streamdeck --version
```

Alternative package managers:
```bash
# Yarn
yarn global add @elgato/cli

# pnpm
pnpm add -g @elgato/cli
```

## VS Code Setup

### Recommended Extensions

1. **TypeScript and JavaScript**
   - ESLint
   - Prettier - Code formatter
   - TypeScript Vue Plugin

2. **Stream Deck Development**
   - Live Server (for property inspector testing)
   - JSON Tools

### VS Code Settings

`.vscode/settings.json`:
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Debugger Configuration

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Plugin",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## Project Creation

### Using CLI Wizard

```bash
# Run creation wizard
streamdeck create

# Answer prompts:
# - Plugin name
# - Plugin UUID (reverse-DNS format)
# - Author name
# - Action name
# - Action UUID
```

Example UUID: `com.yourcompany.pluginname`

### Manual Setup

1. Create directory structure:
```bash
mkdir my-plugin
cd my-plugin
mkdir -p src/actions ui imgs
```

2. Initialize npm:
```bash
npm init -y
```

3. Install dependencies:
```bash
npm install @elgato/streamdeck
npm install -D @rollup/plugin-node-resolve @rollup/plugin-typescript rollup typescript
```

4. Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "experimentalDecorators": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Development Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "@elgato/streamdeck": "latest"
  },
  "devDependencies": {
    "@rollup/plugin-node-resolve": "latest",
    "@rollup/plugin-typescript": "latest",
    "@types/node": "^20",
    "rollup": "latest",
    "typescript": "latest"
  }
}
```

### Optional Dependencies

```bash
# For HTTP requests
npm install axios

# For WebSocket clients
npm install ws

# For file operations
npm install fs-extra

# For testing
npm install -D jest @types/jest ts-jest
```

## Build Configuration

### Rollup Config

`rollup.config.mjs`:
```javascript
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/plugin.ts',
  output: {
    file: 'com.company.plugin.sdPlugin/bin/plugin.js',
    format: 'cjs',
    sourcemap: false,
    exports: 'auto'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    }),
    resolve({
      preferBuiltins: true,
      exportConditions: ['node']
    })
  ],
  external: ['path', 'fs', 'os', 'events']
};
```

### Package Scripts

`package.json`:
```json
{
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c -w",
    "dev": "rollup -c -w --watch.onEnd=\"streamdeck restart com.company.plugin\"",
    "link": "streamdeck link com.company.plugin.sdPlugin",
    "validate": "streamdeck validate com.company.plugin.sdPlugin",
    "pack": "streamdeck pack com.company.plugin.sdPlugin"
  }
}
```

## Environment Variables

### Development vs Production

`.env.development`:
```
DEBUG=true
LOG_LEVEL=debug
API_URL=http://localhost:3000
```

`.env.production`:
```
DEBUG=false
LOG_LEVEL=info
API_URL=https://api.production.com
```

Load in plugin:
```typescript
import { config } from 'dotenv';
config();

const isDev = process.env.DEBUG === 'true';
```

## Git Setup

### .gitignore

```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build output
*.sdPlugin/bin/
*.sdPlugin/logs/
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
```

### Git Hooks

Using Husky:
```bash
npm install -D husky lint-staged

# Setup
npx husky install
npx husky add .husky/pre-commit "npm test"
```

## Troubleshooting Setup

### Node Version Issues

```bash
# Check current version
node -v

# Switch to correct version
nvm use 20
```

### CLI Not Found

```bash
# Check global install location
npm list -g --depth=0

# Reinstall
npm install -g @elgato/cli --force
```

### Permission Issues (macOS/Linux)

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Stream Deck Not Detecting Plugin

1. Restart Stream Deck application
2. Check plugin is in correct location:
   - Windows: `%AppData%\Elgato\StreamDeck\Plugins`
   - macOS: `~/Library/Application Support/com.elgato.StreamDeck/Plugins`

## Quick Start Checklist

- [ ] Node.js 20+ installed
- [ ] Stream Deck CLI installed
- [ ] Stream Deck application running
- [ ] VS Code with extensions
- [ ] Project created with `streamdeck create`
- [ ] Dependencies installed (`npm install`)
- [ ] Build successful (`npm run build`)
- [ ] Plugin linked (`npm run link`)
- [ ] Plugin appears in Stream Deck
