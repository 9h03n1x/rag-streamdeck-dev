# Stream Deck API Quick Reference

## Event Flow

```
Stream Deck → Plugin:
├── willAppear        (action appears)
├── willDisappear     (action disappears)
├── keyDown           (key pressed)
├── keyUp             (key released)
├── didReceiveSettings
├── propertyInspectorDidAppear
└── propertyInspectorDidDisappear

Plugin → Stream Deck:
├── setTitle          (update title)
├── setImage          (update image)
├── setState          (change state)
├── showOk           (show checkmark)
├── showAlert        (show warning)
├── setSettings      (save settings)
├── getSettings      (request settings)
└── logMessage       (write to log)
```

## Essential Code Snippets

### Plugin Initialization

```javascript
const WebSocket = require('ws');

const port = process.argv[2];
const pluginUUID = process.argv[3];
const registerEvent = process.argv[4];
const info = JSON.parse(process.argv[5]);

const ws = new WebSocket(`ws://127.0.0.1:${port}`);

ws.on('open', () => {
  ws.send(JSON.stringify({
    event: registerEvent,
    uuid: pluginUUID
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  handleMessage(message);
});
```

### Set Title

```javascript
ws.send(JSON.stringify({
  event: 'setTitle',
  context: context,
  payload: {
    title: 'My Title',
    target: 0  // 0=both, 1=hardware, 2=software
  }
}));
```

### Set Image

```javascript
// From file path
ws.send(JSON.stringify({
  event: 'setImage',
  context: context,
  payload: {
    image: 'images/icon.png',
    target: 0
  }
}));

// Base64 encoded
ws.send(JSON.stringify({
  event: 'setImage',
  context: context,
  payload: {
    image: 'data:image/png;base64,iVBORw0KGgo...',
    target: 0
  }
}));

// SVG
const svg = `<svg>...</svg>`;
ws.send(JSON.stringify({
  event: 'setImage',
  context: context,
  payload: {
    image: `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}`,
    target: 0
  }
}));
```

### Toggle State

```javascript
const currentState = message.payload.state;
const newState = currentState === 0 ? 1 : 0;

ws.send(JSON.stringify({
  event: 'setState',
  context: context,
  payload: {
    state: newState
  }
}));
```

### Show Feedback

```javascript
// Show OK (checkmark)
ws.send(JSON.stringify({
  event: 'showOk',
  context: context
}));

// Show Alert (exclamation)
ws.send(JSON.stringify({
  event: 'showAlert',
  context: context
}));
```

### Save Settings

```javascript
// Action settings (per instance)
ws.send(JSON.stringify({
  event: 'setSettings',
  context: context,
  payload: {
    mySetting: 'value'
  }
}));

// Global settings (shared)
ws.send(JSON.stringify({
  event: 'setGlobalSettings',
  context: pluginUUID,
  payload: {
    apiKey: 'secret'
  }
}));
```

### Request Settings

```javascript
// Action settings
ws.send(JSON.stringify({
  event: 'getSettings',
  context: context
}));

// Global settings
ws.send(JSON.stringify({
  event: 'getGlobalSettings',
  context: pluginUUID
}));
```

### Open URL

```javascript
ws.send(JSON.stringify({
  event: 'openUrl',
  payload: {
    url: 'https://example.com'
  }
}));
```

### Log Message

```javascript
ws.send(JSON.stringify({
  event: 'logMessage',
  payload: {
    message: 'Debug information'
  }
}));
```

### Send to Property Inspector

```javascript
// From plugin to PI
ws.send(JSON.stringify({
  event: 'sendToPropertyInspector',
  action: action,
  context: context,
  payload: {
    customData: 'value'
  }
}));

// From PI to plugin
ws.send(JSON.stringify({
  event: 'sendToPlugin',
  action: action,
  context: context,
  payload: {
    customData: 'value'
  }
}));
```

## Property Inspector

### Connection

```javascript
let websocket = null;
let uuid = null;

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
  uuid = inUUID;
  
  websocket = new WebSocket('ws://127.0.0.1:' + inPort);
  
  websocket.onopen = () => {
    websocket.send(JSON.stringify({
      event: inRegisterEvent,
      uuid: uuid
    }));
    
    websocket.send(JSON.stringify({
      event: 'getSettings',
      context: uuid
    }));
  };
  
  websocket.onmessage = (evt) => {
    const message = JSON.parse(evt.data);
    handleMessage(message);
  };
}
```

### Save Settings from PI

```javascript
function saveSettings(settings) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({
      event: 'setSettings',
      context: uuid,
      payload: settings
    }));
  }
}
```

## Context Management

```javascript
class ContextManager {
  constructor() {
    this.contexts = new Map();
  }
  
  add(context, data) {
    this.contexts.set(context, data);
  }
  
  get(context) {
    return this.contexts.get(context);
  }
  
  remove(context) {
    this.contexts.delete(context);
  }
  
  update(context, data) {
    const existing = this.contexts.get(context) || {};
    this.contexts.set(context, { ...existing, ...data });
  }
}

const contextManager = new ContextManager();

// Add on willAppear
function handleWillAppear(message) {
  contextManager.add(message.context, {
    device: message.device,
    settings: message.payload.settings,
    coordinates: message.payload.coordinates
  });
}

// Remove on willDisappear
function handleWillDisappear(message) {
  contextManager.remove(message.context);
}
```

## Common Patterns

### Periodic Updates

```javascript
const updateIntervals = new Map();

function startUpdating(context, interval = 5000) {
  stopUpdating(context);
  
  const timer = setInterval(() => {
    updateDisplay(context);
  }, interval);
  
  updateIntervals.set(context, timer);
}

function stopUpdating(context) {
  const timer = updateIntervals.get(context);
  if (timer) {
    clearInterval(timer);
    updateIntervals.delete(context);
  }
}

// Start on willAppear
function handleWillAppear(message) {
  startUpdating(message.context);
}

// Stop on willDisappear
function handleWillDisappear(message) {
  stopUpdating(message.context);
}
```

### Debouncing

```javascript
function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

const updateTitle = debounce((context, title) => {
  ws.send(JSON.stringify({
    event: 'setTitle',
    context: context,
    payload: { title: title }
  }));
}, 250);
```

### Error Handling

```javascript
function safeHandle(handler) {
  return (message) => {
    try {
      handler(message);
    } catch (error) {
      console.error('Error:', error);
      
      ws.send(JSON.stringify({
        event: 'showAlert',
        context: message.context
      }));
      
      ws.send(JSON.stringify({
        event: 'logMessage',
        payload: {
          message: `Error: ${error.message}`
        }
      }));
    }
  };
}

// Use with handlers
const handleKeyUp = safeHandle((message) => {
  // Your code here
});
```

### Async Operations

```javascript
async function handleKeyUp(message) {
  const context = message.context;
  
  try {
    // Show loading
    ws.send(JSON.stringify({
      event: 'setTitle',
      context: context,
      payload: { title: 'Loading...' }
    }));
    
    // Async operation
    const result = await fetchData();
    
    // Update with result
    ws.send(JSON.stringify({
      event: 'setTitle',
      context: context,
      payload: { title: result }
    }));
    
    // Show success
    ws.send(JSON.stringify({
      event: 'showOk',
      context: context
    }));
    
  } catch (error) {
    // Show error
    ws.send(JSON.stringify({
      event: 'showAlert',
      context: context
    }));
    
    ws.send(JSON.stringify({
      event: 'setTitle',
      context: context,
      payload: { title: 'Error' }
    }));
  }
}
```

## Image Sizes

| Device | Standard | High-Res (@2x) |
|--------|----------|----------------|
| Stream Deck | 72x72 | 144x144 |
| Stream Deck Mini | 80x80 | 160x160 |
| Stream Deck XL | 96x96 | 192x192 |

**Recommended**: Always provide 144x144 for best quality across devices.

## Target Values

| Value | Description |
|-------|-------------|
| 0 | Hardware and software |
| 1 | Hardware only |
| 2 | Software only |

## Device Types

| Type | Device | Grid |
|------|--------|------|
| 0 | Stream Deck | 5x3 (15 keys) |
| 1 | Stream Deck Mini | 3x2 (6 keys) |
| 2 | Stream Deck XL | 8x4 (32 keys) |
| 3 | Stream Deck Mobile | Variable |
| 4 | Corsair GKeys | Variable |

## Manifest Quick Reference

```json
{
  "Name": "Plugin Name",
  "Version": "1.0.0",
  "Author": "Your Name",
  "Actions": [
    {
      "Name": "Action Name",
      "UUID": "com.author.plugin.action",
      "Icon": "images/action",
      "States": [{"Image": "images/state"}],
      "Controllers": ["Keypad"]
    }
  ],
  "CodePath": "plugin.js",
  "Description": "Description",
  "Icon": "images/icon",
  "SDKVersion": 2,
  "Software": {
    "MinimumVersion": "4.1"
  },
  "OS": [
    {"Platform": "mac", "MinimumVersion": "10.11"},
    {"Platform": "windows", "MinimumVersion": "10"}
  ]
}
```

## File Locations

**macOS:**
- Plugins: `~/Library/Application Support/com.elgato.StreamDeck/Plugins/`
- Logs: `~/Library/Logs/com.elgato.StreamDeck/`

**Windows:**
- Plugins: `%appdata%\Elgato\StreamDeck\Plugins\`
- Logs: `%appdata%\Elgato\StreamDeck\logs\`

## Useful Commands

```bash
# Validate JSON
cat manifest.json | jq .

# Watch logs (macOS)
tail -f ~/Library/Logs/com.elgato.StreamDeck/*.log

# Watch logs (Windows)
Get-Content "$env:APPDATA\Elgato\StreamDeck\logs\*.log" -Wait

# Set permissions (macOS/Linux)
chmod +x plugin.js
```
