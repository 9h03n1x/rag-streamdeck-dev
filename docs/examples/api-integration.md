# API Integration Example

This example demonstrates how to integrate external APIs into a Stream Deck plugin, with periodic updates and error handling.

## Weather Plugin Example

A plugin that displays current weather on a Stream Deck key.

### manifest.json

```json
{
  "Name": "Weather Plugin",
  "Version": "1.0.0",
  "Author": "Your Name",
  "Actions": [
    {
      "Name": "Current Weather",
      "UUID": "com.example.weather.current",
      "Icon": "images/weather",
      "Tooltip": "Display current weather",
      "States": [
        {
          "Image": "images/weather"
        }
      ],
      "PropertyInspectorPath": "propertyinspector/inspector.html"
    }
  ],
  "Category": "Weather",
  "CategoryIcon": "images/icon",
  "CodePath": "plugin.js",
  "Description": "Display weather information",
  "Icon": "images/icon",
  "SDKVersion": 2,
  "Software": {
    "MinimumVersion": "4.1"
  }
}
```

### plugin.js

```javascript
const WebSocket = require('ws');
const axios = require('axios');

// Configuration
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5/weather';
const UPDATE_INTERVAL = 300000; // 5 minutes

class WeatherPlugin {
  constructor(websocket, pluginUUID) {
    this.ws = websocket;
    this.pluginUUID = pluginUUID;
    this.contexts = new Map();
    this.updateTimers = new Map();
    this.apiKey = null;
    
    // Request global settings on startup
    this.requestGlobalSettings();
  }
  
  requestGlobalSettings() {
    this.ws.send(JSON.stringify({
      event: 'getGlobalSettings',
      context: this.pluginUUID
    }));
  }
  
  handleMessage(message) {
    switch (message.event) {
      case 'didReceiveGlobalSettings':
        this.handleGlobalSettings(message);
        break;
      case 'willAppear':
        this.handleWillAppear(message);
        break;
      case 'willDisappear':
        this.handleWillDisappear(message);
        break;
      case 'keyUp':
        this.handleKeyUp(message);
        break;
      case 'didReceiveSettings':
        this.handleDidReceiveSettings(message);
        break;
    }
  }
  
  handleGlobalSettings(message) {
    const settings = message.payload.settings;
    this.apiKey = settings.apiKey;
    
    // Update all active contexts
    this.contexts.forEach((data, context) => {
      this.updateWeather(context);
    });
  }
  
  handleWillAppear(message) {
    const context = message.context;
    const settings = message.payload.settings;
    
    // Store context data
    this.contexts.set(context, {
      location: settings.location || 'London',
      units: settings.units || 'metric',
      lastUpdate: null,
      weatherData: null
    });
    
    // Initial update
    this.updateWeather(context);
    
    // Start periodic updates
    this.startPeriodicUpdate(context);
  }
  
  handleWillDisappear(message) {
    const context = message.context;
    
    // Stop updates
    this.stopPeriodicUpdate(context);
    
    // Remove context
    this.contexts.delete(context);
  }
  
  handleKeyUp(message) {
    const context = message.context;
    
    // Force update on key press
    this.updateWeather(context);
  }
  
  handleDidReceiveSettings(message) {
    const context = message.context;
    const settings = message.payload.settings;
    
    const contextData = this.contexts.get(context);
    if (contextData) {
      contextData.location = settings.location || 'London';
      contextData.units = settings.units || 'metric';
      
      // Update with new settings
      this.updateWeather(context);
    }
  }
  
  async updateWeather(context) {
    const contextData = this.contexts.get(context);
    if (!contextData) return;
    
    if (!this.apiKey) {
      this.showError(context, 'No API Key');
      return;
    }
    
    try {
      // Show loading state
      this.setTitle(context, 'Loading...');
      
      // Fetch weather data
      const response = await axios.get(WEATHER_API_BASE, {
        params: {
          q: contextData.location,
          appid: this.apiKey,
          units: contextData.units
        },
        timeout: 5000
      });
      
      const data = response.data;
      contextData.weatherData = data;
      contextData.lastUpdate = new Date();
      
      // Update display
      this.displayWeather(context, data);
      
      // Show success feedback
      this.ws.send(JSON.stringify({
        event: 'showOk',
        context: context
      }));
      
    } catch (error) {
      console.error('Weather fetch error:', error);
      this.showError(context, 'Error');
      
      // Log detailed error
      this.log(`Weather API error for ${contextData.location}: ${error.message}`);
      
      // Show alert feedback
      this.ws.send(JSON.stringify({
        event: 'showAlert',
        context: context
      }));
    }
  }
  
  displayWeather(context, data) {
    const contextData = this.contexts.get(context);
    if (!contextData) return;
    
    // Get temperature
    const temp = Math.round(data.main.temp);
    const units = contextData.units === 'metric' ? '°C' : '°F';
    
    // Get weather condition
    const condition = data.weather[0].main;
    
    // Update title
    this.setTitle(context, `${temp}${units}\n${condition}`);
    
    // Generate dynamic icon based on weather
    const weatherIcon = this.generateWeatherIcon(condition, temp, units);
    this.setImage(context, weatherIcon);
  }
  
  generateWeatherIcon(condition, temp, units) {
    // Color based on condition
    const colors = {
      'Clear': '#FFD700',
      'Clouds': '#B0C4DE',
      'Rain': '#4682B4',
      'Snow': '#FFFFFF',
      'Thunderstorm': '#8B008B',
      'Drizzle': '#87CEEB',
      'Mist': '#D3D3D3'
    };
    
    const color = colors[condition] || '#808080';
    
    // Generate SVG
    const svg = `
      <svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
        <rect width="144" height="144" fill="#2c3e50"/>
        <circle cx="72" cy="60" r="30" fill="${color}"/>
        <text x="72" y="115" text-anchor="middle" font-size="24" 
              font-weight="bold" fill="white">${temp}${units}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}`;
  }
  
  showError(context, message) {
    this.setTitle(context, message);
    this.setImage(context, this.generateErrorIcon(message));
  }
  
  generateErrorIcon(message) {
    const svg = `
      <svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
        <rect width="144" height="144" fill="#c0392b"/>
        <text x="72" y="80" text-anchor="middle" font-size="48" 
              font-weight="bold" fill="white">!</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}`;
  }
  
  startPeriodicUpdate(context) {
    // Clear existing timer
    this.stopPeriodicUpdate(context);
    
    // Create new timer
    const timer = setInterval(() => {
      this.updateWeather(context);
    }, UPDATE_INTERVAL);
    
    this.updateTimers.set(context, timer);
  }
  
  stopPeriodicUpdate(context) {
    const timer = this.updateTimers.get(context);
    if (timer) {
      clearInterval(timer);
      this.updateTimers.delete(context);
    }
  }
  
  setTitle(context, title) {
    this.ws.send(JSON.stringify({
      event: 'setTitle',
      context: context,
      payload: {
        title: title,
        target: 0
      }
    }));
  }
  
  setImage(context, image) {
    this.ws.send(JSON.stringify({
      event: 'setImage',
      context: context,
      payload: {
        image: image,
        target: 0
      }
    }));
  }
  
  log(message) {
    this.ws.send(JSON.stringify({
      event: 'logMessage',
      payload: {
        message: `[Weather Plugin] ${message}`
      }
    }));
  }
}

// Initialize plugin
const port = process.argv[2];
const pluginUUID = process.argv[3];
const registerEvent = process.argv[4];
const info = JSON.parse(process.argv[5]);

const ws = new WebSocket(`ws://127.0.0.1:${port}`);
let plugin = null;

ws.on('open', () => {
  console.log('Connected to Stream Deck');
  
  // Register plugin
  ws.send(JSON.stringify({
    event: registerEvent,
    uuid: pluginUUID
  }));
  
  // Create plugin instance
  plugin = new WeatherPlugin(ws, pluginUUID);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    if (plugin) {
      plugin.handleMessage(message);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

### propertyinspector/inspector.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weather Settings</title>
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
    
    .sdpi-item-value input,
    .sdpi-item-value select {
      width: 100%;
      padding: 8px;
      border: 1px solid #3d3d3d;
      background: #2d2d2d;
      color: #d8d8d8;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .sdpi-item-value input:focus,
    .sdpi-item-value select:focus {
      outline: none;
      border-color: #5a91d8;
    }
    
    .description {
      font-size: 11px;
      color: #969696;
      margin-top: 5px;
    }
    
    .global-settings {
      border-top: 1px solid #3d3d3d;
      padding-top: 15px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="sdpi-wrapper">
    <div class="sdpi-item">
      <div class="sdpi-item-label">Location</div>
      <div class="sdpi-item-value">
        <input type="text" id="location" placeholder="Enter city name">
      </div>
      <div class="description">City name (e.g., London, New York, Tokyo)</div>
    </div>
    
    <div class="sdpi-item">
      <div class="sdpi-item-label">Units</div>
      <div class="sdpi-item-value">
        <select id="units">
          <option value="metric">Celsius (°C)</option>
          <option value="imperial">Fahrenheit (°F)</option>
        </select>
      </div>
    </div>
    
    <div class="global-settings">
      <div class="sdpi-item">
        <div class="sdpi-item-label">API Key (Global)</div>
        <div class="sdpi-item-value">
          <input type="password" id="apiKey" placeholder="Enter OpenWeatherMap API key">
        </div>
        <div class="description">
          Get a free API key at 
          <a href="#" onclick="openURL('https://openweathermap.org/api')">
            openweathermap.org/api
          </a>
        </div>
      </div>
    </div>
  </div>
  
  <script src="inspector.js"></script>
</body>
</html>
```

### propertyinspector/inspector.js

```javascript
let websocket = null;
let uuid = null;
let settings = {};
let globalSettings = {};

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
  uuid = inUUID;
  
  const actionInfo = JSON.parse(inActionInfo);
  settings = actionInfo.payload.settings;
  
  websocket = new WebSocket('ws://127.0.0.1:' + inPort);
  
  websocket.onopen = () => {
    // Register
    websocket.send(JSON.stringify({
      event: inRegisterEvent,
      uuid: uuid
    }));
    
    // Request settings
    websocket.send(JSON.stringify({
      event: 'getSettings',
      context: uuid
    }));
    
    // Request global settings
    websocket.send(JSON.stringify({
      event: 'getGlobalSettings',
      context: uuid
    }));
  };
  
  websocket.onmessage = (evt) => {
    const message = JSON.parse(evt.data);
    
    if (message.event === 'didReceiveSettings') {
      settings = message.payload.settings;
      updateUI();
    } else if (message.event === 'didReceiveGlobalSettings') {
      globalSettings = message.payload.settings;
      updateGlobalUI();
    }
  };
  
  setupEventListeners();
  updateUI();
}

function setupEventListeners() {
  // Location input
  document.getElementById('location').addEventListener('change', (e) => {
    saveSettings({ location: e.target.value });
  });
  
  // Units select
  document.getElementById('units').addEventListener('change', (e) => {
    saveSettings({ units: e.target.value });
  });
  
  // API key input
  document.getElementById('apiKey').addEventListener('change', (e) => {
    saveGlobalSettings({ apiKey: e.target.value });
  });
}

function updateUI() {
  document.getElementById('location').value = settings.location || '';
  document.getElementById('units').value = settings.units || 'metric';
}

function updateGlobalUI() {
  document.getElementById('apiKey').value = globalSettings.apiKey || '';
}

function saveSettings(newSettings) {
  settings = { ...settings, ...newSettings };
  
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({
      event: 'setSettings',
      context: uuid,
      payload: settings
    }));
  }
}

function saveGlobalSettings(newSettings) {
  globalSettings = { ...globalSettings, ...newSettings };
  
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({
      event: 'setGlobalSettings',
      context: uuid,
      payload: globalSettings
    }));
  }
}

function openURL(url) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({
      event: 'openUrl',
      payload: {
        url: url
      }
    }));
  }
}
```

## Key Concepts Demonstrated

1. **API Integration**: Using axios to make HTTP requests
2. **Global Settings**: Storing API keys globally
3. **Action Settings**: Storing location and units per key
4. **Periodic Updates**: Automatically updating weather every 5 minutes
5. **Error Handling**: Catching and displaying API errors
6. **Dynamic Icons**: Generating SVG images based on weather data
7. **User Feedback**: Using showOk/showAlert for visual feedback
8. **Async Operations**: Handling asynchronous API calls properly

## Dependencies

Install required npm packages:

```bash
npm install ws axios
```

## Testing

1. Get a free API key from OpenWeatherMap
2. Install the plugin
3. Add the Weather action to a key
4. Configure location and API key in the property inspector
5. The weather should update automatically every 5 minutes
6. Press the key to force an immediate update
