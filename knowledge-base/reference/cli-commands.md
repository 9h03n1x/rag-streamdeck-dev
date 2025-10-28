# CLI Commands Reference

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
streamdeck validate <path-to-sdPlugin>

# Example
streamdeck validate com.company.plugin.sdPlugin
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
streamdeck pack <path-to-sdPlugin>

# Example
streamdeck pack com.company.plugin.sdPlugin

# Output: com.company.plugin.streamDeckPlugin
```

## streamdeck dev

Enable developer mode (remote debugging).

```bash
streamdeck dev

# Access debugger at http://localhost:23654/
```

## streamdeck logs

View plugin logs (if available).

```bash
streamdeck logs <UUID>

# Example
streamdeck logs com.company.plugin
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
npm run link
```

### Development
```bash
npm run watch  # Or npm run dev
# Edit files - auto-rebuild and restart
```

### Before Release
```bash
npm run build
streamdeck validate com.company.plugin.sdPlugin
streamdeck pack com.company.plugin.sdPlugin
```

### Debugging
```bash
streamdeck dev
# Open http://localhost:23654/
```
