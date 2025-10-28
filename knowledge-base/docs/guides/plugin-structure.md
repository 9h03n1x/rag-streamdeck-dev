# Stream Deck Plugin Structure

## Basic Plugin Structure

```
MyPlugin.sdPlugin/
├── manifest.json           # Plugin configuration and metadata
├── plugin.js              # Main plugin code (Node.js/JavaScript)
├── propertyinspector/     # Property inspector UI files
│   ├── inspector.html
│   ├── inspector.js
│   └── inspector.css
├── images/                # Plugin icons and action images
│   ├── icon.png          # Plugin icon
│   ├── icon@2x.png       # High-res plugin icon
│   ├── action.png        # Action icon
│   └── action@2x.png     # High-res action icon
└── localization/         # Localization files (optional)
    └── en.json
```

## manifest.json

The manifest.json file is required and defines your plugin's metadata, actions, and configuration.

### Essential Fields

```json
{
  "Name": "My Plugin",
  "Version": "1.0.0",
  "Author": "Your Name",
  "Actions": [
    {
      "Name": "My Action",
      "UUID": "com.yourname.myplugin.myaction",
      "Icon": "images/action",
      "Tooltip": "Description of what this action does",
      "States": [
        {
          "Image": "images/action"
        }
      ],
      "PropertyInspectorPath": "propertyinspector/inspector.html",
      "SupportedInMultiActions": true,
      "Controllers": ["Keypad"]
    }
  ],
  "Category": "Custom",
  "CategoryIcon": "images/icon",
  "CodePath": "plugin.js",
  "Description": "A brief description of your plugin",
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

## UUID Naming Convention

Use reverse domain notation for UUIDs:
- Plugin UUID: `com.yourname.pluginname`
- Action UUID: `com.yourname.pluginname.actionname`

## Plugin Types

### JavaScript/Node.js Plugins

The most common type. The plugin runs as a Node.js process.

```javascript
// plugin.js
const WebSocket = require('ws');

// Connection parameters passed as command line arguments
const port = process.argv[2];
const pluginUUID = process.argv[3];
const registerEvent = process.argv[4];
const info = JSON.parse(process.argv[5]);

// Create WebSocket connection
const ws = new WebSocket(`ws://127.0.0.1:${port}`);

ws.on('open', () => {
  // Register plugin
  ws.send(JSON.stringify({
    event: registerEvent,
    uuid: pluginUUID
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  
  switch(message.event) {
    case 'keyDown':
      handleKeyDown(message);
      break;
    case 'keyUp':
      handleKeyUp(message);
      break;
    case 'willAppear':
      handleWillAppear(message);
      break;
    // ... handle other events
  }
});
```

### HTML/JavaScript Plugins (Property Inspector)

Property inspectors are HTML pages that provide UI for configuring actions.

```html
<!-- propertyinspector/inspector.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="inspector.css">
</head>
<body>
  <div class="sdpi-wrapper">
    <div class="sdpi-item">
      <div class="sdpi-item-label">Setting Name</div>
      <input class="sdpi-item-value" type="text" id="mySetting">
    </div>
  </div>
  <script src="inspector.js"></script>
</body>
</html>
```

```javascript
// propertyinspector/inspector.js
let websocket = null;
let uuid = null;
let actionInfo = {};

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
  uuid = inUUID;
  actionInfo = JSON.parse(inActionInfo);
  
  websocket = new WebSocket('ws://127.0.0.1:' + inPort);
  
  websocket.onopen = () => {
    websocket.send(JSON.stringify({
      event: inRegisterEvent,
      uuid: uuid
    }));
    
    // Request settings
    websocket.send(JSON.stringify({
      event: 'getSettings',
      context: uuid
    }));
  };
  
  websocket.onmessage = (evt) => {
    const jsonObj = JSON.parse(evt.data);
    
    if (jsonObj.event === 'didReceiveSettings') {
      const settings = jsonObj.payload.settings;
      document.getElementById('mySetting').value = settings.mySetting || '';
    }
  };
}

// Save setting when changed
document.getElementById('mySetting').addEventListener('input', (e) => {
  const settings = {
    mySetting: e.target.value
  };
  
  websocket.send(JSON.stringify({
    event: 'setSettings',
    context: uuid,
    payload: settings
  }));
});
```

## Multi-Action Support

Actions can be used in multi-actions (chains of actions):

```json
{
  "Actions": [
    {
      "Name": "My Action",
      "UUID": "com.yourname.myplugin.myaction",
      "SupportedInMultiActions": true
    }
  ]
}
```

In your plugin code:

```javascript
ws.on('message', (data) => {
  const message = JSON.parse(data);
  
  if (message.event === 'keyDown') {
    const isInMultiAction = message.payload.isInMultiAction;
    
    if (isInMultiAction) {
      // Handle as part of multi-action
      // Don't show OK/Alert as it disrupts the chain
    } else {
      // Handle as standalone action
      // Can show OK/Alert feedback
    }
  }
});
```

## Multi-State Actions

Actions can have multiple states (like a toggle):

```json
{
  "Actions": [
    {
      "Name": "Toggle Action",
      "UUID": "com.yourname.myplugin.toggle",
      "States": [
        {
          "Image": "images/off",
          "Name": "Off State"
        },
        {
          "Image": "images/on",
          "Name": "On State"
        }
      ]
    }
  ]
}
```

Toggle state in code:

```javascript
function handleKeyUp(message) {
  const currentState = message.payload.state;
  const newState = currentState === 0 ? 1 : 0;
  
  ws.send(JSON.stringify({
    event: 'setState',
    context: message.context,
    payload: {
      state: newState
    }
  }));
}
```

## Controllers

Specify which Stream Deck controllers support your action:

- `"Keypad"` - Standard keys (most common)
- `"Encoder"` - Rotary encoders (Stream Deck+)

```json
{
  "Actions": [
    {
      "Name": "My Action",
      "Controllers": ["Keypad", "Encoder"]
    }
  ]
}
```

## Global Settings vs Action Settings

### Action Settings
Stored per action instance. Use for settings specific to each key.

```javascript
// Save action settings
ws.send(JSON.stringify({
  event: 'setSettings',
  context: context,
  payload: {
    actionSpecificSetting: 'value'
  }
}));

// Retrieve action settings
ws.send(JSON.stringify({
  event: 'getSettings',
  context: context
}));
```

### Global Settings
Shared across all action instances. Use for plugin-wide settings like API keys.

```javascript
// Save global settings
ws.send(JSON.stringify({
  event: 'setGlobalSettings',
  context: pluginUUID,
  payload: {
    apiKey: 'secret-key'
  }
}));

// Retrieve global settings
ws.send(JSON.stringify({
  event: 'getGlobalSettings',
  context: pluginUUID
}));
```

## Localization

Add support for multiple languages:

```
localization/
├── en.json
├── de.json
├── fr.json
└── ja.json
```

Example en.json:

```json
{
  "Name": "My Plugin",
  "Description": "Plugin description",
  "Actions": [
    {
      "Name": "My Action",
      "Tooltip": "Action tooltip"
    }
  ]
}
```

Enable in manifest.json:

```json
{
  "Name": "My Plugin",
  "Localization": {
    "Translations": ["en", "de", "fr", "ja"]
  }
}
```

## Best Practices

1. **Error Handling**: Always wrap event handlers in try-catch blocks
2. **Logging**: Use `logMessage` event for debugging
3. **Performance**: Minimize processing in event handlers
4. **State Management**: Keep track of contexts and their states
5. **Cleanup**: Clean up resources in `willDisappear` event
6. **Testing**: Test on all supported Stream Deck models
7. **Icons**: Provide high-resolution (@2x) images
8. **Settings**: Validate all user inputs in property inspector
9. **Documentation**: Include clear setup instructions
10. **Updates**: Use semantic versioning for plugin updates
