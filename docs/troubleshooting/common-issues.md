# Stream Deck Plugin Troubleshooting Guide

## Common Issues and Solutions

### Plugin Not Appearing in Stream Deck

#### Issue: Plugin doesn't show up after installation

**Possible Causes:**
1. Invalid manifest.json
2. Plugin in wrong directory
3. Incorrect file permissions
4. Missing required fields

**Solutions:**

1. **Validate manifest.json**
   ```bash
   # Use a JSON validator
   cat manifest.json | jq .
   ```
   - Check for syntax errors (missing commas, brackets)
   - Ensure all required fields are present
   - Verify UUID format uses reverse domain notation

2. **Check plugin directory location**
   - macOS: `~/Library/Application Support/com.elgato.StreamDeck/Plugins/`
   - Windows: `%appdata%\Elgato\StreamDeck\Plugins\`
   - Plugin folder must end with `.sdPlugin`

3. **Verify file permissions (macOS/Linux)**
   ```bash
   chmod +x YourPlugin.sdPlugin/plugin.js
   # or for binary:
   chmod +x YourPlugin.sdPlugin/plugin
   ```

4. **Check Stream Deck logs**
   - macOS: `~/Library/Logs/com.elgato.StreamDeck/`
   - Windows: `%appdata%\Elgato\StreamDeck\logs\`

5. **Restart Stream Deck completely**
   - Quit Stream Deck application
   - Kill background processes
   - Restart

### WebSocket Connection Issues

#### Issue: Plugin can't connect to Stream Deck

**Symptoms:**
- Plugin starts but doesn't respond to events
- No communication with Stream Deck
- Actions don't work

**Solutions:**

1. **Verify registration code**
   ```javascript
   ws.on('open', () => {
     ws.send(JSON.stringify({
       event: registerEvent,  // Must use the exact event from command line args
       uuid: pluginUUID       // Must use the exact UUID from command line args
     }));
   });
   ```

2. **Check command line arguments**
   ```javascript
   // Correct order is important
   const port = process.argv[2];
   const pluginUUID = process.argv[3];
   const registerEvent = process.argv[4];
   const info = JSON.parse(process.argv[5]);
   ```

3. **Add connection error handling**
   ```javascript
   ws.on('error', (error) => {
     console.error('WebSocket error:', error);
   });
   
   ws.on('close', () => {
     console.log('Connection closed');
   });
   ```

4. **Test WebSocket URL**
   ```javascript
   // Verify the port is correct
   const ws = new WebSocket(`ws://127.0.0.1:${port}`);
   console.log(`Connecting to: ws://127.0.0.1:${port}`);
   ```

### Property Inspector Not Loading

#### Issue: Property inspector is blank or doesn't load

**Possible Causes:**
1. JavaScript errors in inspector
2. Incorrect path in manifest
3. Missing connectElgatoStreamDeckSocket function
4. CORS issues

**Solutions:**

1. **Check browser console**
   - Right-click property inspector window
   - Select "Inspect Element" or "Developer Tools"
   - Look for JavaScript errors in console

2. **Verify PropertyInspectorPath**
   ```json
   {
     "PropertyInspectorPath": "propertyinspector/inspector.html"
   }
   ```
   - Path is relative to plugin root
   - File must exist at specified location

3. **Implement required function**
   ```javascript
   // This function MUST exist and have this exact name
   function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
     // Your connection code here
   }
   ```

4. **Check for CORS issues**
   - Property inspector runs in a browser context
   - External resources must have proper CORS headers
   - Consider bundling resources locally

5. **Verify WebSocket connection in PI**
   ```javascript
   websocket.onopen = () => {
     console.log('PI connected');
   };
   
   websocket.onerror = (error) => {
     console.error('PI WebSocket error:', error);
   };
   ```

### Images Not Displaying

#### Issue: Action icons or images don't show up

**Possible Causes:**
1. Missing image files
2. Incorrect path in manifest
3. Wrong image format
4. Missing @2x images

**Solutions:**

1. **Check image paths**
   ```json
   {
     "Icon": "images/icon"  // Don't include .png or @2x
   }
   ```
   - Provide both `icon.png` and `icon@2x.png`
   - Paths are relative to plugin root

2. **Verify image formats**
   - PNG format is required
   - SVG can be used as base64 data URL
   - Recommended sizes:
     - Standard: 72x72 pixels
     - @2x: 144x144 pixels

3. **Check dynamic image code**
   ```javascript
   // For base64 images
   const image = `data:image/png;base64,${base64Data}`;
   
   // For SVG
   const svg = `<svg>...</svg>`;
   const image = `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}`;
   ```

4. **Verify setImage call**
   ```javascript
   ws.send(JSON.stringify({
     event: 'setImage',
     context: context,
     payload: {
       image: imageData,  // Must be valid data URL or path
       target: 0
     }
   }));
   ```

### Settings Not Persisting

#### Issue: Settings are lost when Stream Deck restarts

**Possible Causes:**
1. Settings not being saved properly
2. Using wrong context
3. Not handling didReceiveSettings event

**Solutions:**

1. **Save settings correctly**
   ```javascript
   function saveSettings(context, settings) {
     ws.send(JSON.stringify({
       event: 'setSettings',
       context: context,  // Use the correct context
       payload: settings  // Settings object
     }));
   }
   ```

2. **Request settings on willAppear**
   ```javascript
   function handleWillAppear(message) {
     const context = message.context;
     
     // Request settings
     ws.send(JSON.stringify({
       event: 'getSettings',
       context: context
     }));
   }
   ```

3. **Handle didReceiveSettings**
   ```javascript
   function handleDidReceiveSettings(message) {
     const context = message.context;
     const settings = message.payload.settings;
     
     // Use the settings
     console.log('Received settings:', settings);
   }
   ```

4. **Use global settings for shared data**
   ```javascript
   // Save global settings
   ws.send(JSON.stringify({
     event: 'setGlobalSettings',
     context: pluginUUID,
     payload: globalSettings
   }));
   
   // Get global settings
   ws.send(JSON.stringify({
     event: 'getGlobalSettings',
     context: pluginUUID
   }));
   ```

### Plugin Crashes or Hangs

#### Issue: Plugin stops responding or crashes Stream Deck

**Possible Causes:**
1. Unhandled exceptions
2. Infinite loops
3. Memory leaks
4. Blocking operations

**Solutions:**

1. **Add error handling**
   ```javascript
   ws.on('message', (data) => {
     try {
       const message = JSON.parse(data);
       handleMessage(message);
     } catch (error) {
       console.error('Error:', error);
       logError(error);
     }
   });
   ```

2. **Avoid blocking operations**
   ```javascript
   // Bad - blocks event loop
   const data = fs.readFileSync('large-file.txt');
   
   // Good - non-blocking
   fs.readFile('large-file.txt', (err, data) => {
     if (err) console.error(err);
     // Process data
   });
   
   // Better - async/await
   try {
     const data = await fs.promises.readFile('large-file.txt');
     // Process data
   } catch (error) {
     console.error(error);
   }
   ```

3. **Clean up resources**
   ```javascript
   function handleWillDisappear(message) {
     const context = message.context;
     
     // Clean up timers
     if (timers.has(context)) {
       clearInterval(timers.get(context));
       timers.delete(context);
     }
     
     // Clean up other resources
     contexts.delete(context);
   }
   ```

4. **Limit API calls**
   ```javascript
   // Use debouncing
   const debounce = (func, delay) => {
     let timer;
     return (...args) => {
       clearTimeout(timer);
       timer = setTimeout(() => func(...args), delay);
     };
   };
   
   const updateAPI = debounce((data) => {
     // API call
   }, 1000);
   ```

5. **Monitor memory usage**
   ```javascript
   setInterval(() => {
     const usage = process.memoryUsage();
     console.log('Memory:', Math.round(usage.heapUsed / 1024 / 1024), 'MB');
   }, 60000);
   ```

### Actions Not Responding to Key Presses

#### Issue: Keys don't respond when pressed

**Possible Causes:**
1. Not handling keyUp/keyDown events
2. Wrong context being used
3. Missing event handlers

**Solutions:**

1. **Implement key event handlers**
   ```javascript
   function handleMessage(message) {
     switch (message.event) {
       case 'keyDown':
         handleKeyDown(message);
         break;
       case 'keyUp':
         handleKeyUp(message);
         break;
     }
   }
   ```

2. **Verify context management**
   ```javascript
   const contexts = new Map();
   
   function handleWillAppear(message) {
     // Store context when action appears
     contexts.set(message.context, {
       device: message.device,
       settings: message.payload.settings
     });
   }
   
   function handleKeyUp(message) {
     // Use stored context
     const contextData = contexts.get(message.context);
     if (!contextData) return;
     
     // Handle key press
   }
   ```

3. **Add logging**
   ```javascript
   function handleKeyUp(message) {
     console.log('Key pressed:', message.context);
     
     ws.send(JSON.stringify({
       event: 'logMessage',
       payload: {
         message: `Key pressed: ${message.context}`
       }
     }));
   }
   ```

### Multi-State Actions Not Working

#### Issue: State doesn't change when setState is called

**Possible Causes:**
1. Only one state defined in manifest
2. Incorrect state value
3. Not tracking current state

**Solutions:**

1. **Define multiple states in manifest**
   ```json
   {
     "States": [
       {
         "Image": "images/state0",
         "Name": "State 0"
       },
       {
         "Image": "images/state1",
         "Name": "State 1"
       }
     ]
   }
   ```

2. **Track state correctly**
   ```javascript
   const states = new Map();
   
   function handleWillAppear(message) {
     const context = message.context;
     const initialState = message.payload.state || 0;
     states.set(context, initialState);
   }
   
   function toggleState(context) {
     const currentState = states.get(context) || 0;
     const newState = currentState === 0 ? 1 : 0;
     
     states.set(context, newState);
     
     ws.send(JSON.stringify({
       event: 'setState',
       context: context,
       payload: {
         state: newState
       }
     }));
   }
   ```

3. **Use valid state values**
   ```javascript
   // State must be 0 or 1 for two-state actions
   // For single-state actions, don't use setState
   ```

## Debugging Tools

### Enable Verbose Logging

```javascript
const DEBUG = true;

function debug(message) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`);
    
    ws.send(JSON.stringify({
      event: 'logMessage',
      payload: {
        message: `[DEBUG] ${message}`
      }
    }));
  }
}
```

### Log All Events

```javascript
ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Event:', message.event, message);
  
  handleMessage(message);
});
```

### View Stream Deck Logs

**macOS:**
```bash
tail -f ~/Library/Logs/com.elgato.StreamDeck/*.log
```

**Windows:**
```powershell
Get-Content "$env:APPDATA\Elgato\StreamDeck\logs\*.log" -Wait
```

### Use Chrome DevTools for Property Inspector

1. Right-click on property inspector
2. Select "Inspect Element"
3. Use Console, Network, and Elements tabs for debugging

### Test WebSocket Messages

```javascript
// Send test message
ws.send(JSON.stringify({
  event: 'logMessage',
  payload: {
    message: 'Test message from plugin'
  }
}));
```

## Getting Help

1. **Check Stream Deck Developer Documentation**
   - https://developer.elgato.com/documentation/stream-deck/

2. **Stream Deck Developer Forums**
   - Search for similar issues
   - Post with detailed error logs

3. **GitHub Issues**
   - Check plugin examples
   - Review issue trackers for similar problems

4. **Include in Support Requests**
   - Plugin version
   - Stream Deck software version
   - Operating system and version
   - Complete error logs
   - Steps to reproduce
   - manifest.json (if relevant)

## Checklist for Debugging

- [ ] Is manifest.json valid JSON?
- [ ] Are all required files present?
- [ ] Are command line arguments parsed correctly?
- [ ] Is WebSocket connection established?
- [ ] Is plugin registered correctly?
- [ ] Are all events being handled?
- [ ] Are contexts being tracked properly?
- [ ] Are settings being saved and loaded?
- [ ] Are errors being caught and logged?
- [ ] Are resources being cleaned up?
- [ ] Have you checked the Stream Deck logs?
- [ ] Have you tested on a clean install?
