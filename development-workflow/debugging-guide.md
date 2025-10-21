---
category: development-workflow
title: Debugging Guide
tags: [debugging, vscode, chrome-devtools, remote-debugger, logging, troubleshooting]
difficulty: intermediate
sdk-version: v2
related-files: [environment-setup.md, common-issues.md, testing-strategies.md]
description: Complete debugging guide for Stream Deck plugins including VS Code, Chrome DevTools, and remote debugging
---

# Debugging Guide

## Node.js Debugger

### Enable Debugging

Debugging is enabled by default in manifest.json:

```json
{
  "Nodejs": {
    "Version": "20",
    "Debug": "enabled"
  }
}
```

### VS Code Debugger

1. **Launch Configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Stream Deck Plugin",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"],
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/**/*.js"]
    }
  ]
}
```

2. **Start Debugging**:
   - Run plugin in Stream Deck
   - In VS Code: F5 or Run > Start Debugging
   - Set breakpoints in TypeScript files
   - Trigger action in Stream Deck

### Chrome DevTools

1. Navigate to `chrome://inspect`
2. Click "Configure" and ensure `localhost:9229` is listed
3. Find your plugin in "Remote Target"
4. Click "inspect"

### Breakpoints

```typescript
@action({ UUID: "com.company.plugin.action" })
class MyAction extends SingletonAction {
    override async onKeyDown(ev: KeyDownEvent) {
        // Set breakpoint here
        const settings = ev.payload.settings;
        debugger; // Or use JavaScript debugger statement
        
        await this.processAction(settings);
    }
}
```

## Property Inspector Debugging

### Enable Remote Debugging

```bash
# Enable developer mode
streamdeck dev

# Or manually in manifest
{
  "Nodejs": {
    "Debug": "enabled"
  }
}
```

### Access Chrome DevTools

1. Open browser: `http://localhost:23654/`
2. Find your property inspector in list
3. Click "inspect"
4. Use Chrome DevTools normally

**Note**: Property inspector must be visible in Stream Deck to appear in list.

### Console Logging

```javascript
// In property inspector
console.log('Settings received:', settings);
console.error('Error:', error);
console.table(data);
```

### Debugging Tips

```javascript
// Check if streamDeckClient is available
if (window.SDPIComponents) {
    console.log('sdpi-components loaded');
}

// Log all events
const { streamDeckClient } = SDPIComponents;
streamDeckClient.on('*', (event, data) => {
    console.log('Event:', event, data);
});
```

## Logging

### Plugin Logging

```typescript
import streamDeck from "@elgato/streamdeck";

// Log levels
streamDeck.logger.trace("Trace message");
streamDeck.logger.debug("Debug info");
streamDeck.logger.info("Information");
streamDeck.logger.warn("Warning");
streamDeck.logger.error("Error occurred");
```

### Log Files

Logs are written to:
- Windows: `%AppData%\\Elgato\\StreamDeck\\Plugins\\{UUID}.sdPlugin\\logs\\`
- macOS: `~/Library/Application Support/com.elgato.StreamDeck/Plugins/{UUID}.sdPlugin/logs/`

### Custom Logger

```typescript
class CustomLogger {
    private context: string;
    
    constructor(context: string) {
        this.context = context;
    }
    
    log(level: string, message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${this.context}] [${level}] ${message}`;
        
        streamDeck.logger.info(logMessage);
        
        if (data) {
            streamDeck.logger.info(JSON.stringify(data, null, 2));
        }
    }
    
    info(message: string, data?: any) {
        this.log('INFO', message, data);
    }
    
    error(message: string, error?: Error) {
        this.log('ERROR', message, {
            message: error?.message,
            stack: error?.stack
        });
    }
}

// Usage
const logger = new CustomLogger('MyAction');
logger.info('Action started');
logger.error('Failed to connect', error);
```

## Network Debugging

### Monitor WebSocket

```typescript
// Log all WebSocket messages
streamDeck.client.on('message', (data) => {
    streamDeck.logger.debug('WS Message:', data);
});

streamDeck.client.on('send', (data) => {
    streamDeck.logger.debug('WS Send:', data);
});
```

### HTTP Debugging

```typescript
import axios from 'axios';

// Add request interceptor
axios.interceptors.request.use(request => {
    streamDeck.logger.debug('HTTP Request:', {
        url: request.url,
        method: request.method,
        headers: request.headers,
        data: request.data
    });
    return request;
});

// Add response interceptor
axios.interceptors.response.use(
    response => {
        streamDeck.logger.debug('HTTP Response:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        streamDeck.logger.error('HTTP Error:', {
            message: error.message,
            response: error.response?.data
        });
        throw error;
    }
);
```

## Performance Debugging

### Measure Execution Time

```typescript
class PerformanceMonitor {
    private timers: Map<string, number> = new Map();
    
    start(label: string) {
        this.timers.set(label, Date.now());
    }
    
    end(label: string) {
        const start = this.timers.get(label);
        if (start) {
            const duration = Date.now() - start;
            streamDeck.logger.info(`${label}: ${duration}ms`);
            this.timers.delete(label);
        }
    }
}

// Usage
const perf = new PerformanceMonitor();

override async onKeyDown(ev: KeyDownEvent) {
    perf.start('action-execution');
    await this.performAction();
    perf.end('action-execution');
}
```

### Memory Monitoring

```typescript
setInterval(() => {
    const mem = process.memoryUsage();
    streamDeck.logger.debug('Memory:', {
        rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`
    });
}, 60000); // Every minute
```

## Error Handling

### Global Error Handler

```typescript
process.on('uncaughtException', (error) => {
    streamDeck.logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    streamDeck.logger.error('Unhandled Rejection:', reason);
});
```

### Action Error Wrapper

```typescript
function handleErrors<T extends SingletonAction>(
    target: T,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
        try {
            return await originalMethod.apply(this, args);
        } catch (error) {
            streamDeck.logger.error(`Error in ${propertyKey}:`, error);
            
            // Show alert on Stream Deck
            const ev = args[0];
            if (ev?.action) {
                await ev.action.showAlert();
            }
        }
    };
    
    return descriptor;
}

// Usage
@action({ UUID: "com.company.action" })
class MyAction extends SingletonAction {
    @handleErrors
    override async onKeyDown(ev: KeyDownEvent) {
        // Your code - errors auto-handled
    }
}
```

## Debugging Tools

### Stream Deck CLI Commands

```bash
# Validate plugin
streamdeck validate com.company.plugin.sdPlugin

# Restart plugin
streamdeck restart com.company.plugin

# View logs
streamdeck logs com.company.plugin

# Enable/disable debug mode
streamdeck dev
```

### Manifest Validation

```bash
# Check manifest schema
npx ajv-cli validate \
  -s https://schemas.elgato.com/streamdeck/plugins/manifest.json \
  -d com.company.plugin.sdPlugin/manifest.json
```

## Common Issues

### Plugin Not Loading

**Symptoms**: Plugin doesn't appear in Stream Deck

**Debug Steps**:
1. Check logs: `streamdeck logs com.company.plugin`
2. Verify manifest.json syntax
3. Check CodePath points to correct file
4. Ensure Node.js version matches manifest
5. Restart Stream Deck application

### WebSocket Connection Failed

**Symptoms**: Plugin starts but events not received

**Debug Steps**:
```typescript
streamDeck.client.on('error', (error) => {
    console.error('WebSocket error:', error);
});

streamDeck.client.on('close', (code, reason) => {
    console.log('WebSocket closed:', code, reason);
});
```

### Property Inspector Not Showing

**Symptoms**: UI doesn't appear when action selected

**Debug Steps**:
1. Check PropertyInspectorPath in manifest
2. Verify HTML file exists
3. Check browser console for errors
4. Ensure sdpi-components script loaded
5. Check for JavaScript errors

### Settings Not Persisting

**Symptoms**: Settings lost after restart

**Debug Steps**:
```typescript
override async onDidReceiveSettings(ev: DidReceiveSettingsEvent) {
    streamDeck.logger.info('Settings received:', ev.payload.settings);
    
    // Verify settings structure
    if (!this.validateSettings(ev.payload.settings)) {
        streamDeck.logger.warn('Invalid settings structure');
    }
}
```

## Best Practices

1. **Always Log**: Log important events and errors
2. **Use Debugger**: Step through code with breakpoints
3. **Validate Data**: Check all inputs and outputs
4. **Test Edge Cases**: Test with missing/invalid data
5. **Monitor Performance**: Track execution times
6. **Handle Errors**: Graceful error handling everywhere
7. **Clear Logs**: Clean up old log files periodically
8. **Version Logging**: Log plugin version on startup
