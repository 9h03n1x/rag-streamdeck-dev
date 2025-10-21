# Getting Started with Stream Deck Plugin Development

This guide will walk you through creating your first Stream Deck plugin from scratch.

## Prerequisites

### Software Requirements

- **Stream Deck Software**: Version 4.1 or later
- **Node.js**: Version 14 or later (for JavaScript plugins)
- **Text Editor**: VS Code, Sublime Text, or any code editor
- **Git**: For version control (optional)

### Knowledge Requirements

- Basic JavaScript/Node.js
- Understanding of asynchronous programming
- Familiarity with WebSockets
- Basic JSON knowledge

## Quick Start

### 1. Create Plugin Structure

Create a directory with the `.sdPlugin` extension:

```bash
mkdir MyFirstPlugin.sdPlugin
cd MyFirstPlugin.sdPlugin
```

Create the following structure:

```
MyFirstPlugin.sdPlugin/
├── manifest.json
├── plugin.js
├── images/
│   ├── icon.png
│   ├── icon@2x.png
│   ├── action.png
│   └── action@2x.png
└── propertyinspector/
    ├── inspector.html
    └── inspector.js
```

### 2. Create manifest.json

```json
{
  "Name": "My First Plugin",
  "Version": "1.0.0",
  "Author": "Your Name",
  "Actions": [
    {
      "Name": "My Action",
      "UUID": "com.yourname.myfirstplugin.myaction",
      "Icon": "images/action",
      "Tooltip": "Press to do something",
      "States": [
        {
          "Image": "images/action"
        }
      ]
    }
  ],
  "Category": "Custom",
  "CategoryIcon": "images/icon",
  "CodePath": "plugin.js",
  "Description": "My first Stream Deck plugin",
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

### 3. Create plugin.js

```javascript
const WebSocket = require('ws');

// Parse command line arguments
const port = process.argv[2];
const pluginUUID = process.argv[3];
const registerEvent = process.argv[4];
const info = JSON.parse(process.argv[5]);

// Create WebSocket connection
const ws = new WebSocket(`ws://127.0.0.1:${port}`);

ws.on('open', () => {
  console.log('Connected to Stream Deck');
  
  // Register plugin
  ws.send(JSON.stringify({
    event: registerEvent,
    uuid: pluginUUID
  }));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    
    switch (message.event) {
      case 'keyUp':
        handleKeyUp(message);
        break;
      case 'willAppear':
        handleWillAppear(message);
        break;
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

function handleWillAppear(message) {
  const context = message.context;
  
  // Set initial title
  ws.send(JSON.stringify({
    event: 'setTitle',
    context: context,
    payload: {
      title: 'Hello!',
      target: 0
    }
  }));
}

function handleKeyUp(message) {
  const context = message.context;
  
  // Update title
  ws.send(JSON.stringify({
    event: 'setTitle',
    context: context,
    payload: {
      title: 'Pressed!',
      target: 0
    }
  }));
  
  // Show OK feedback
  ws.send(JSON.stringify({
    event: 'showOk',
    context: context
  }));
  
  // Reset after 2 seconds
  setTimeout(() => {
    ws.send(JSON.stringify({
      event: 'setTitle',
      context: context,
      payload: {
        title: 'Hello!',
        target: 0
      }
    }));
  }, 2000);
}

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

### 4. Create Images

You'll need four image files:

- `images/icon.png` - Plugin icon (72x72 pixels)
- `images/icon@2x.png` - High-res plugin icon (144x144 pixels)
- `images/action.png` - Action icon (72x72 pixels)
- `images/action@2x.png` - High-res action icon (144x144 pixels)

**Quick Tip:** Create simple colored squares for testing:
```javascript
// You can generate SVG images programmatically in your plugin
const svg = `
  <svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
    <rect width="144" height="144" fill="#4A90E2"/>
    <text x="72" y="80" text-anchor="middle" font-size="48" fill="white">A</text>
  </svg>
`;
```

### 5. Install the Plugin

**macOS:**
```bash
cp -r MyFirstPlugin.sdPlugin ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/
```

**Windows:**
```powershell
Copy-Item -Recurse MyFirstPlugin.sdPlugin "$env:APPDATA\Elgato\StreamDeck\Plugins\"
```

### 6. Restart Stream Deck

1. Quit Stream Deck application completely
2. Restart Stream Deck
3. Your plugin should appear in the actions list

### 7. Test Your Plugin

1. Open Stream Deck software
2. Look for "My First Plugin" in the actions list
3. Drag "My Action" to a key
4. Press the key to test it

## Next Steps

### Add a Property Inspector

Create `propertyinspector/inspector.html` using [SDPI Components](https://sdpi-components.dev/):

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Settings</title>
  <script src="sdpi-components.js"></script>
</head>
<body>
  <sdpi-item label="Message">
    <sdpi-textfield setting="message" placeholder="Enter message"></sdpi-textfield>
  </sdpi-item>
  
  <sdpi-item label="Enable Notifications">
    <sdpi-checkbox setting="notifications"></sdpi-checkbox>
  </sdpi-item>
</body>
</html>
```

> **Note**: SDPI Components handles the JavaScript communication automatically. Download `sdpi-components.js` from [https://sdpi-components.dev/releases/v4/sdpi-components.js](https://sdpi-components.dev/releases/v4/sdpi-components.js)

Create `propertyinspector/inspector.js`:

```javascript
let websocket = null;
let uuid = null;
let settings = {};

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
  uuid = inUUID;
  const actionInfo = JSON.parse(inActionInfo);
  settings = actionInfo.payload.settings;
  
  websocket = new WebSocket('ws://127.0.0.1:' + inPort);
  
  websocket.onopen = () => {
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
  
  // Set up event listeners
  document.getElementById('message').addEventListener('change', (e) => {
    settings.message = e.target.value;
    websocket.send(JSON.stringify({
      event: 'setSettings',
      context: uuid,
      payload: settings
    }));
  });
  
  updateUI();
}

function updateUI() {
  document.getElementById('message').value = settings.message || '';
}
```

Update `manifest.json` to include property inspector:

```json
{
  "Actions": [
    {
      "Name": "My Action",
      "UUID": "com.yourname.myfirstplugin.myaction",
      "PropertyInspectorPath": "propertyinspector/inspector.html",
      ...
    }
  ]
}
```

### Use Settings in Plugin

Update `plugin.js` to use the message setting:

```javascript
const contexts = new Map();

function handleWillAppear(message) {
  const context = message.context;
  const settings = message.payload.settings;
  
  contexts.set(context, settings);
  updateTitle(context);
}

function handleDidReceiveSettings(message) {
  const context = message.context;
  const settings = message.payload.settings;
  
  contexts.set(context, settings);
  updateTitle(context);
}

function updateTitle(context) {
  const settings = contexts.get(context) || {};
  const title = settings.message || 'Hello!';
  
  ws.send(JSON.stringify({
    event: 'setTitle',
    context: context,
    payload: {
      title: title,
      target: 0
    }
  }));
}
```

Don't forget to handle the `didReceiveSettings` event:

```javascript
switch (message.event) {
  case 'keyUp':
    handleKeyUp(message);
    break;
  case 'willAppear':
    handleWillAppear(message);
    break;
  case 'didReceiveSettings':
    handleDidReceiveSettings(message);
    break;
}
```

## Development Tips

### 1. Use npm for Dependencies

Initialize npm in your plugin directory:

```bash
npm init -y
npm install ws
```

### 2. Enable Logging

View logs during development:

**macOS:**
```bash
tail -f ~/Library/Logs/com.elgato.StreamDeck/*.log
```

**Windows:**
```powershell
Get-Content "$env:APPDATA\Elgato\StreamDeck\logs\*.log" -Wait
```

### 3. Rapid Development Cycle

1. Make code changes
2. Copy plugin to Stream Deck plugins folder
3. Restart Stream Deck
4. Test changes

Consider creating a build script:

```bash
#!/bin/bash
# build.sh
rm -rf ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/MyFirstPlugin.sdPlugin
cp -r MyFirstPlugin.sdPlugin ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/
osascript -e 'quit app "Stream Deck"'
sleep 2
open -a "Stream Deck"
```

### 4. Debug with console.log

```javascript
console.log('Debug info:', someVariable);

// Also log to Stream Deck logs
ws.send(JSON.stringify({
  event: 'logMessage',
  payload: {
    message: `Debug info: ${JSON.stringify(someVariable)}`
  }
}));
```

### 5. Test Error Handling

```javascript
try {
  // Your code
} catch (error) {
  console.error('Error:', error);
  
  ws.send(JSON.stringify({
    event: 'showAlert',
    context: context
  }));
  
  ws.send(JSON.stringify({
    event: 'logMessage',
    payload: {
      message: `Error: ${error.message}\n${error.stack}`
    }
  }));
}
```

## Common Gotchas

1. **UUID Format**: Must use reverse domain notation (e.g., `com.author.plugin.action`)
2. **Image Paths**: Don't include `.png` or `@2x` in manifest
3. **Registration**: Must register plugin on WebSocket open
4. **Context**: Each action instance has a unique context - track them!
5. **Settings**: Use `setSettings` to save, handle `didReceiveSettings` to load
6. **Case Sensitivity**: Event names are case-sensitive
7. **JSON**: Manifest must be valid JSON (no trailing commas!)
8. **Restart**: Must restart Stream Deck after plugin changes

## Resources

- **Official Documentation**: https://developer.elgato.com/documentation/stream-deck/
- **Sample Plugins**: https://github.com/elgatosf/streamdeck-plugins
- **Developer Forums**: https://discord.gg/elgato
- **This RAG Repository**: Reference docs in `docs/` directory

## What's Next?

- Learn about [Plugin Structure](plugin-structure.md)
- Review [Best Practices](best-practices.md)
- Study [API Integration Example](../examples/api-integration.md)
- Explore [Troubleshooting Guide](../troubleshooting/common-issues.md)

## Distribution

Once your plugin is ready:

1. Test thoroughly on both macOS and Windows
2. Create proper documentation
3. Submit to Stream Deck Marketplace
4. Or distribute directly as `.streamDeckPlugin` file

Happy coding!
