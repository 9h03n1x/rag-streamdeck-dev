# Stream Deck Plugin Development Best Practices

## Plugin Architecture

### 1. Separation of Concerns

Organize your code into logical modules:

```javascript
// plugin.js
const EventHandler = require('./src/eventHandler');
const ActionManager = require('./src/actionManager');
const SettingsManager = require('./src/settingsManager');

class StreamDeckPlugin {
  constructor(websocket, pluginUUID) {
    this.ws = websocket;
    this.pluginUUID = pluginUUID;
    this.eventHandler = new EventHandler(this);
    this.actionManager = new ActionManager(this);
    this.settingsManager = new SettingsManager(this);
  }
  
  handleMessage(message) {
    this.eventHandler.handle(message);
  }
}
```

### 2. Context Management

Keep track of all active action contexts:

```javascript
class ContextManager {
  constructor() {
    this.contexts = new Map();
  }
  
  add(context, data) {
    this.contexts.set(context, {
      device: data.device,
      settings: data.settings,
      coordinates: data.coordinates,
      state: data.state || 0
    });
  }
  
  get(context) {
    return this.contexts.get(context);
  }
  
  remove(context) {
    this.contexts.delete(context);
  }
  
  getAll() {
    return Array.from(this.contexts.entries());
  }
}
```

### 3. Settings Caching

Cache settings to avoid redundant requests:

```javascript
class SettingsCache {
  constructor(websocket) {
    this.ws = websocket;
    this.cache = new Map();
    this.globalSettings = null;
  }
  
  async getSettings(context) {
    if (this.cache.has(context)) {
      return this.cache.get(context);
    }
    
    return new Promise((resolve) => {
      const handler = (message) => {
        if (message.event === 'didReceiveSettings' && message.context === context) {
          this.cache.set(context, message.payload.settings);
          resolve(message.payload.settings);
        }
      };
      
      // Add temporary listener
      this.ws.on('message', handler);
      
      // Request settings
      this.ws.send(JSON.stringify({
        event: 'getSettings',
        context: context
      }));
    });
  }
  
  updateSettings(context, settings) {
    this.cache.set(context, settings);
    this.ws.send(JSON.stringify({
      event: 'setSettings',
      context: context,
      payload: settings
    }));
  }
}
```

## Error Handling

### 1. Graceful Error Recovery

```javascript
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    handleMessage(message);
  } catch (error) {
    console.error('Error processing message:', error);
    logError(error);
  }
});

function logError(error) {
  ws.send(JSON.stringify({
    event: 'logMessage',
    payload: {
      message: `Error: ${error.message}\nStack: ${error.stack}`
    }
  }));
}
```

### 2. User Feedback

Provide clear feedback for errors:

```javascript
function handleActionError(context, error) {
  // Show alert on key
  ws.send(JSON.stringify({
    event: 'showAlert',
    context: context
  }));
  
  // Update title with error message
  ws.send(JSON.stringify({
    event: 'setTitle',
    context: context,
    payload: {
      title: 'Error',
      target: 0
    }
  }));
  
  // Log error
  logError(error);
}
```

## Performance Optimization

### 1. Debouncing Frequent Updates

```javascript
class Debouncer {
  constructor(func, delay) {
    this.func = func;
    this.delay = delay;
    this.timers = new Map();
  }
  
  call(key, ...args) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    const timer = setTimeout(() => {
      this.func(...args);
      this.timers.delete(key);
    }, this.delay);
    
    this.timers.set(key, timer);
  }
}

// Usage
const updateDebouncer = new Debouncer((context, title) => {
  ws.send(JSON.stringify({
    event: 'setTitle',
    context: context,
    payload: { title: title }
  }));
}, 250);

// Debounce rapid updates
updateDebouncer.call(context, context, newTitle);
```

### 2. Batch Updates

```javascript
class UpdateQueue {
  constructor(websocket, interval = 100) {
    this.ws = websocket;
    this.queue = new Map();
    this.interval = interval;
    this.timer = null;
    this.startProcessing();
  }
  
  add(context, update) {
    this.queue.set(context, update);
  }
  
  startProcessing() {
    this.timer = setInterval(() => {
      this.process();
    }, this.interval);
  }
  
  process() {
    if (this.queue.size === 0) return;
    
    this.queue.forEach((update, context) => {
      this.ws.send(JSON.stringify(update));
    });
    
    this.queue.clear();
  }
  
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
```

### 3. Efficient Image Handling

```javascript
// Cache base64 images
const imageCache = new Map();

async function getImageBase64(imagePath) {
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath);
  }
  
  const fs = require('fs');
  const imageBuffer = await fs.promises.readFile(imagePath);
  const base64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
  
  imageCache.set(imagePath, base64);
  return base64;
}

// Use SVG for dynamic content
function generateSVGImage(text, color) {
  const svg = `
    <svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
      <rect width="144" height="144" fill="${color}"/>
      <text x="72" y="72" text-anchor="middle" dominant-baseline="middle" 
            font-size="24" fill="white">${text}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}`;
}
```

## State Management

### 1. Tracking Multiple States

```javascript
class StateManager {
  constructor(websocket) {
    this.ws = websocket;
    this.states = new Map();
  }
  
  initialize(context, initialState = 0) {
    this.states.set(context, initialState);
  }
  
  toggle(context) {
    const currentState = this.states.get(context) || 0;
    const newState = currentState === 0 ? 1 : 0;
    this.setState(context, newState);
  }
  
  setState(context, state) {
    this.states.set(context, state);
    
    this.ws.send(JSON.stringify({
      event: 'setState',
      context: context,
      payload: { state: state }
    }));
  }
  
  getState(context) {
    return this.states.get(context) || 0;
  }
  
  cleanup(context) {
    this.states.delete(context);
  }
}
```

### 2. Synchronizing State Across Instances

```javascript
class StateSynchronizer {
  constructor(websocket) {
    this.ws = websocket;
    this.groups = new Map();
  }
  
  addToGroup(groupId, context) {
    if (!this.groups.has(groupId)) {
      this.groups.set(groupId, new Set());
    }
    this.groups.get(groupId).add(context);
  }
  
  syncState(groupId, state) {
    const contexts = this.groups.get(groupId);
    if (!contexts) return;
    
    contexts.forEach(context => {
      this.ws.send(JSON.stringify({
        event: 'setState',
        context: context,
        payload: { state: state }
      }));
    });
  }
  
  removeFromGroup(groupId, context) {
    const group = this.groups.get(groupId);
    if (group) {
      group.delete(context);
      if (group.size === 0) {
        this.groups.delete(groupId);
      }
    }
  }
}
```

## External API Integration

### 1. HTTP Request Handling

```javascript
const axios = require('axios');

class APIClient {
  constructor(baseURL, apiKey) {
    this.client = axios.create({
      baseURL: baseURL,
      timeout: 5000,
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
  }
  
  async get(endpoint) {
    try {
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      throw error;
    }
  }
  
  async post(endpoint, data) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      throw error;
    }
  }
}
```

### 2. Polling for Updates

```javascript
class Poller {
  constructor(callback, interval = 5000) {
    this.callback = callback;
    this.interval = interval;
    this.timer = null;
    this.contexts = new Set();
  }
  
  addContext(context) {
    this.contexts.add(context);
    if (this.contexts.size === 1) {
      this.start();
    }
  }
  
  removeContext(context) {
    this.contexts.delete(context);
    if (this.contexts.size === 0) {
      this.stop();
    }
  }
  
  start() {
    if (this.timer) return;
    
    this.timer = setInterval(async () => {
      try {
        const data = await this.callback();
        this.contexts.forEach(context => {
          // Update each context with new data
          this.updateContext(context, data);
        });
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, this.interval);
  }
  
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  updateContext(context, data) {
    // Override in subclass or pass as parameter
  }
}
```

## Property Inspector Best Practices

### 1. Communication Pattern

```javascript
// propertyinspector/inspector.js

class PropertyInspector {
  constructor() {
    this.websocket = null;
    this.uuid = null;
    this.settings = {};
  }
  
  connect(port, uuid, registerEvent, info, actionInfo) {
    this.uuid = uuid;
    
    this.websocket = new WebSocket(`ws://127.0.0.1:${port}`);
    
    this.websocket.onopen = () => {
      this.register(registerEvent);
      this.requestSettings();
    };
    
    this.websocket.onmessage = (evt) => {
      this.handleMessage(JSON.parse(evt.data));
    };
  }
  
  register(event) {
    this.send({
      event: event,
      uuid: this.uuid
    });
  }
  
  requestSettings() {
    this.send({
      event: 'getSettings',
      context: this.uuid
    });
  }
  
  handleMessage(message) {
    switch (message.event) {
      case 'didReceiveSettings':
        this.settings = message.payload.settings;
        this.updateUI();
        break;
      case 'sendToPropertyInspector':
        this.handlePluginMessage(message.payload);
        break;
    }
  }
  
  updateUI() {
    // Update form fields with current settings
    Object.keys(this.settings).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        element.value = this.settings[key];
      }
    });
  }
  
  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.send({
      event: 'setSettings',
      context: this.uuid,
      payload: this.settings
    });
  }
  
  sendToPlugin(payload) {
    this.send({
      event: 'sendToPlugin',
      context: this.uuid,
      payload: payload
    });
  }
  
  send(data) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(data));
    }
  }
  
  handlePluginMessage(payload) {
    // Handle messages from plugin
  }
}

// Global instance
let pi = new PropertyInspector();

function connectElgatoStreamDeckSocket(port, uuid, registerEvent, info, actionInfo) {
  pi.connect(port, uuid, registerEvent, info, actionInfo);
}
```

### 2. Form Validation

```javascript
// Validate inputs before saving
function setupFormValidation() {
  const form = document.getElementById('propertyForm');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const settings = {};
    let isValid = true;
    
    formData.forEach((value, key) => {
      // Validate each field
      const element = form.elements[key];
      const validator = validators[key];
      
      if (validator && !validator(value)) {
        element.classList.add('error');
        isValid = false;
      } else {
        element.classList.remove('error');
        settings[key] = value;
      }
    });
    
    if (isValid) {
      pi.saveSettings(settings);
    }
  });
}

const validators = {
  apiKey: (value) => value.length >= 10,
  interval: (value) => !isNaN(value) && value >= 1 && value <= 3600,
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
};
```

## Testing and Debugging

### 1. Comprehensive Logging

```javascript
class Logger {
  constructor(websocket) {
    this.ws = websocket;
    this.enabled = true;
  }
  
  log(message, level = 'INFO') {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    console.log(logMessage);
    
    this.ws.send(JSON.stringify({
      event: 'logMessage',
      payload: {
        message: logMessage
      }
    }));
  }
  
  info(message) {
    this.log(message, 'INFO');
  }
  
  warn(message) {
    this.log(message, 'WARN');
  }
  
  error(message) {
    this.log(message, 'ERROR');
  }
  
  debug(message) {
    this.log(message, 'DEBUG');
  }
}
```

### 2. Mock WebSocket for Testing

```javascript
class MockWebSocket {
  constructor() {
    this.messages = [];
    this.listeners = {};
  }
  
  send(data) {
    this.messages.push(JSON.parse(data));
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  simulateMessage(message) {
    const listeners = this.listeners['message'] || [];
    listeners.forEach(callback => callback(JSON.stringify(message)));
  }
  
  getLastMessage() {
    return this.messages[this.messages.length - 1];
  }
  
  getMessages() {
    return this.messages;
  }
}

// Usage in tests
const mockWs = new MockWebSocket();
const plugin = new StreamDeckPlugin(mockWs, 'test-uuid');

// Simulate key press
mockWs.simulateMessage({
  event: 'keyDown',
  context: 'test-context',
  action: 'com.test.action',
  payload: { settings: {} }
});

// Check plugin sent correct response
const lastMessage = mockWs.getLastMessage();
assert.equal(lastMessage.event, 'showOk');
```

## Security Best Practices

### 1. Secure Storage of Credentials

```javascript
// Never store credentials in plain text
// Use system keychain or encrypt sensitive data

const keytar = require('keytar');

async function saveApiKey(apiKey) {
  await keytar.setPassword('MyPlugin', 'apiKey', apiKey);
}

async function getApiKey() {
  return await keytar.getPassword('MyPlugin', 'apiKey');
}
```

### 2. Input Sanitization

```javascript
function sanitizeInput(input) {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

function validateURL(url) {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.href;
  } catch {
    throw new Error('Invalid URL');
  }
}
```

## Distribution Checklist

- [ ] Test on all supported Stream Deck models
- [ ] Test on both macOS and Windows
- [ ] Validate manifest.json syntax
- [ ] Include all required images (@1x and @2x)
- [ ] Add clear documentation
- [ ] Test installation and uninstallation
- [ ] Verify plugin doesn't crash Stream Deck software
- [ ] Check memory usage and performance
- [ ] Include proper error handling
- [ ] Add logging for debugging
- [ ] Version number follows semantic versioning
- [ ] Update changelog
