# CLI Commands Reference

The Stream Deck CLI (`streamdeck`, alias `sd`) is the official tool for creating, linking, validating, debugging, and packaging plugins. Current Elgato docs recommend Node.js 24+ and Stream Deck 7.1+ for CLI-based plugin development.

## Installation

```bash
npm install -g @elgato/cli@latest
streamdeck -v
```

Run `streamdeck --help` or `sd --help` to inspect the installed command surface.

## streamdeck create

Create a new plugin from template.

```bash
streamdeck create

# Follow prompts:
# - Plugin name
# - Plugin UUID
# - Author
# - Action name
# - Action UUID
```

## streamdeck link

Link plugin for development (symlink).

```bash
streamdeck link <path-to-sdPlugin>

# Example
streamdeck link com.company.plugin.sdPlugin
```

## streamdeck unlink

Remove development symlink.

```bash
streamdeck unlink <UUID>

# Example  
streamdeck unlink com.company.plugin
```

## streamdeck restart

Restart a running plugin.

```bash
streamdeck restart <UUID>

# Example
streamdeck restart com.company.plugin
```

## streamdeck validate

Validate plugin structure and manifest.

```bash
streamdeck validate [path-to-sdPlugin]

# Example
streamdeck validate com.company.plugin.sdPlugin

# Force a validation rule update
streamdeck validate --force-update-check

# Recommended in CI to avoid network/update drift
streamdeck validate --no-update-check com.company.plugin.sdPlugin
```

Checks:
- Manifest schema
- Required files
- UUID format
- Icon requirements
- Layout definitions

## streamdeck pack

Package plugin for distribution.

```bash
streamdeck pack [path-to-sdPlugin]

# Example
streamdeck pack com.company.plugin.sdPlugin --output dist/

# Dry run without creating a .streamDeckPlugin
streamdeck pack --dry-run com.company.plugin.sdPlugin

# Write a new manifest Version before packaging
streamdeck pack --version "1.2.3.4" com.company.plugin.sdPlugin

# Recommended in CI
streamdeck pack --no-update-check com.company.plugin.sdPlugin

# Output: com.company.plugin.streamDeckPlugin
```

By default, `pack` excludes `.git`, `/.env*`, `*.log`, and `*.js.map`. Add a `.sdignore` file beside `manifest.json` to exclude more paths using `.gitignore` syntax.

## streamdeck dev

Enable developer mode (remote debugging).

```bash
streamdeck dev

# Disable developer mode
streamdeck dev --disable

# Access debugger at http://localhost:23654/
```

## streamdeck config

View/modify CLI configuration.

```bash
# View config
streamdeck config list

# Set config value
streamdeck config set key value
```

## streamdeck --version

Show CLI version.

```bash
streamdeck --version
```

## streamdeck --help

Show help information.

```bash
streamdeck --help

# Command-specific help
streamdeck create --help
```

## Common Workflows

### Initial Setup
```bash
npm install -g @elgato/cli
streamdeck create
cd my-plugin
npm install
npm run build
streamdeck link *.sdPlugin
```

### Development
```bash
npm run watch  # Or npm run dev
# Edit files - auto-rebuild and restart
```

### Before Release
```bash
npm run build
streamdeck validate --no-update-check com.company.plugin.sdPlugin
streamdeck pack --no-update-check com.company.plugin.sdPlugin --output dist/
```

### Debugging
```bash
streamdeck dev
# Open http://localhost:23654/
```
