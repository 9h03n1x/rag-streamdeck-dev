# Simple Stream Deck Plugin Example

This example shows a complete, minimal Stream Deck plugin that displays a counter and increments it on key press.

## File Structure

```
CounterPlugin.sdPlugin/
├── manifest.json
├── plugin.js
├── propertyinspector/
│   ├── inspector.html
│   └── inspector.js
└── images/
    ├── icon.png
    ├── icon@2x.png
    ├── counter.png
    └── counter@2x.png
```

## manifest.json

```json
{
  "Name": "Counter Plugin",
  "Version": "1.0.0",
  "Author": "Your Name",
  "Actions": [
    {
      "Name": "Counter",
      "UUID": "com.example.counter.increment",
      "Icon": "images/counter",
      "Tooltip": "Press to increment counter",
      "States": [
        {
          "Image": "images/counter"
        }
      ],
      "PropertyInspectorPath": "propertyinspector/inspector.html",
      "SupportedInMultiActions": true,
      "Controllers": ["Keypad"]
    }
  ],
  "Category": "Counter",
  "CategoryIcon": "images/icon",
  "CodePath": "plugin.js",
  "Description": "A simple counter plugin",
  "Icon": "images/icon",
  "SDKVersion": 2,
  "Software": {
    "MinimumVersion": "4.1"
  },
  "OS": [
    {
      "Platform": "mac",
      "MinimumVersion": "10.11"
    },
    {
      "Platform": "windows",
      "MinimumVersion": "10"
    }
  ]
}
```

## plugin.js

```javascript
const WebSocket = require('ws');

// Parse command line arguments
const port = process.argv[2];
const pluginUUID = process.argv[3];
const registerEvent = process.argv[4];
const info = JSON.parse(process.argv[5]);

// Store context data
const contexts = new Map();

// Create WebSocket connection
const ws = new WebSocket(`ws://127.0.0.1:${port}`);

ws.on('open', () => {
  console.log('Connected to Stream Deck');
  
  // Register the plugin
  ws.send(JSON.stringify({
    event: registerEvent,
    uuid: pluginUUID
  }));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    handleMessage(message);
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('Disconnected from Stream Deck');
});

function handleMessage(message) {
  switch (message.event) {
    case 'keyDown':
      handleKeyDown(message);
      break;
    case 'keyUp':
      handleKeyUp(message);
      break;
    case 'willAppear':
      handleWillAppear(message);
      break;
    case 'willDisappear':
      handleWillDisappear(message);
      break;
    case 'didReceiveSettings':
      handleDidReceiveSettings(message);
      break;
    default:
      console.log('Unhandled event:', message.event);
  }
}

function handleWillAppear(message) {
  const context = message.context;
  const settings = message.payload.settings;
  
  // Initialize context data
  contexts.set(context, {
    counter: settings.counter || 0,
    settings: settings
  });
  
  // Update the display
  updateCounter(context);
}

function handleWillDisappear(message) {
  const context = message.context;
  
  // Clean up context data
  contexts.delete(context);
}

function handleKeyUp(message) {
  const context = message.context;
  const contextData = contexts.get(context);
  
  if (!contextData) return;
  
  // Increment counter
  contextData.counter++;
  
  // Save to settings
  saveSettings(context, { counter: contextData.counter });
  
  // Update display
  updateCounter(context);
  
  // Show OK feedback
  ws.send(JSON.stringify({
    event: 'showOk',
    context: context
  }));
}

function handleKeyDown(message) {
  // Key down handler (optional)
}

function handleDidReceiveSettings(message) {
  const context = message.context;
  const settings = message.payload.settings;
  
  const contextData = contexts.get(context);
  if (contextData) {
    contextData.counter = settings.counter || 0;
    contextData.settings = settings;
    updateCounter(context);
  }
}

function updateCounter(context) {
  const contextData = contexts.get(context);
  if (!contextData) return;
  
  // Update title with counter value
  ws.send(JSON.stringify({
    event: 'setTitle',
    context: context,
    payload: {
      title: contextData.counter.toString(),
      target: 0
    }
  }));
}

function saveSettings(context, settings) {
  const contextData = contexts.get(context);
  if (!contextData) return;
  
  // Merge with existing settings
  contextData.settings = { ...contextData.settings, ...settings };
  
  // Send to Stream Deck
  ws.send(JSON.stringify({
    event: 'setSettings',
    context: context,
    payload: contextData.settings
  }));
}

// Log to Stream Deck
function log(message) {
  ws.send(JSON.stringify({
    event: 'logMessage',
    payload: {
      message: `[Counter Plugin] ${message}`
    }
  }));
}
```

## propertyinspector/inspector.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Counter Settings</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: transparent;
      color: #d8d8d8;
    }
    
    .sdpi-wrapper {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .sdpi-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .sdpi-item-label {
      font-size: 12px;
      font-weight: 600;
      color: #969696;
    }
    
    .sdpi-item-value input {
      width: 100%;
      padding: 8px;
      border: 1px solid #3d3d3d;
      background: #2d2d2d;
      color: #d8d8d8;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .sdpi-item-value input:focus {
      outline: none;
      border-color: #5a91d8;
    }
    
    .sdpi-item-value button {
      padding: 8px 16px;
      background: #3d3d3d;
      color: #d8d8d8;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .sdpi-item-value button:hover {
      background: #4d4d4d;
    }
  </style>
</head>
<body>
  <div class="sdpi-wrapper">
    <div class="sdpi-item">
      <div class="sdpi-item-label">Counter Value</div>
      <div class="sdpi-item-value">
        <input type="number" id="counter" min="0" value="0">
      </div>
    </div>
    
    <div class="sdpi-item">
      <div class="sdpi-item-label">Reset Counter</div>
      <div class="sdpi-item-value">
        <button id="resetButton">Reset to 0</button>
      </div>
    </div>
  </div>
  
  <script src="inspector.js"></script>
</body>
</html>
```

## propertyinspector/inspector.js

```javascript
let websocket = null;
let uuid = null;
let settings = {};

// This function is called by Stream Deck
function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
  uuid = inUUID;
  
  // Parse action info
  const actionInfo = JSON.parse(inActionInfo);
  settings = actionInfo.payload.settings;
  
  // Connect to Stream Deck
  websocket = new WebSocket('ws://127.0.0.1:' + inPort);
  
  websocket.onopen = () => {
    console.log('Property Inspector connected');
    
    // Register property inspector
    websocket.send(JSON.stringify({
      event: inRegisterEvent,
      uuid: uuid
    }));
    
    // Request current settings
    websocket.send(JSON.stringify({
      event: 'getSettings',
      context: uuid
    }));
  };
  
  websocket.onmessage = (evt) => {
    const message = JSON.parse(evt.data);
    
    if (message.event === 'didReceiveSettings') {
      settings = message.payload.settings;
      updateUI();
    }
  };
  
  websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize UI
  updateUI();
}

function setupEventListeners() {
  // Counter input
  const counterInput = document.getElementById('counter');
  counterInput.addEventListener('change', (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      saveSettings({ counter: value });
    }
  });
  
  // Reset button
  const resetButton = document.getElementById('resetButton');
  resetButton.addEventListener('click', () => {
    saveSettings({ counter: 0 });
  });
}

function updateUI() {
  // Update counter input
  const counterInput = document.getElementById('counter');
  counterInput.value = settings.counter || 0;
}

function saveSettings(newSettings) {
  // Merge with existing settings
  settings = { ...settings, ...newSettings };
  
  // Send to plugin
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({
      event: 'setSettings',
      context: uuid,
      payload: settings
    }));
  }
}
```

## How to Use

1. **Build the Plugin**: Place all files in the correct structure
2. **Install**: Copy `CounterPlugin.sdPlugin` to:
   - macOS: `~/Library/Application Support/com.elgato.StreamDeck/Plugins/`
   - Windows: `%appdata%\Elgato\StreamDeck\Plugins\`
3. **Restart Stream Deck**: Restart the Stream Deck software
4. **Add Action**: Drag the Counter action to a key
5. **Test**: Press the key to increment the counter

## Customization Ideas

- Add a decrement button
- Set custom increment amounts
- Add color indicators based on counter value
- Play sounds on certain milestones
- Reset counter on long press
- Save daily/weekly stats

## Debugging

View logs in:
- macOS: `~/Library/Logs/com.elgato.StreamDeck/Plugin Logs/`
- Windows: `%appdata%\Elgato\StreamDeck\logs\`

Enable logging in your plugin:
```javascript
function log(message) {
  ws.send(JSON.stringify({
    event: 'logMessage',
    payload: {
      message: `[Counter] ${message}`
    }
  }));
}
```
