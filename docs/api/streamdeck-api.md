# Stream Deck API Reference

## Overview

The Stream Deck SDK provides a JavaScript API for creating plugins that interact with the Stream Deck hardware and software.

## Global Objects

### $SD (Stream Deck Object)

The global `$SD` object is available in the property inspector and provides methods to interact with the Stream Deck.

### WebSocket Connection

Plugins communicate with Stream Deck via WebSocket connections. The connection is established when the plugin starts.

## Plugin Lifecycle Events

### applicationDidLaunch
```javascript
{
  "event": "applicationDidLaunch",
  "payload": {
    "application": "com.example.app"
  }
}
```
Sent when a monitored application launches.

### applicationDidTerminate
```javascript
{
  "event": "applicationDidTerminate",
  "payload": {
    "application": "com.example.app"
  }
}
```
Sent when a monitored application terminates.

### deviceDidConnect
```javascript
{
  "event": "deviceDidConnect",
  "device": "device-id",
  "deviceInfo": {
    "name": "Stream Deck",
    "size": {
      "columns": 5,
      "rows": 3
    },
    "type": 0
  }
}
```
Sent when a Stream Deck device connects.

### deviceDidDisconnect
```javascript
{
  "event": "deviceDidDisconnect",
  "device": "device-id"
}
```
Sent when a Stream Deck device disconnects.

## Action Events

### keyDown
```javascript
{
  "action": "com.example.plugin.action",
  "event": "keyDown",
  "context": "unique-context-id",
  "device": "device-id",
  "payload": {
    "settings": {},
    "coordinates": {
      "column": 0,
      "row": 0
    },
    "state": 0,
    "userDesiredState": 0,
    "isInMultiAction": false
  }
}
```
Sent when a key is pressed.

### keyUp
```javascript
{
  "action": "com.example.plugin.action",
  "event": "keyUp",
  "context": "unique-context-id",
  "device": "device-id",
  "payload": {
    "settings": {},
    "coordinates": {
      "column": 0,
      "row": 0
    },
    "state": 0,
    "userDesiredState": 0,
    "isInMultiAction": false
  }
}
```
Sent when a key is released.

### willAppear
```javascript
{
  "action": "com.example.plugin.action",
  "event": "willAppear",
  "context": "unique-context-id",
  "device": "device-id",
  "payload": {
    "settings": {},
    "coordinates": {
      "column": 0,
      "row": 0
    },
    "state": 0,
    "isInMultiAction": false
  }
}
```
Sent when an action appears on the Stream Deck (when the page is switched to or plugin is added).

### willDisappear
```javascript
{
  "action": "com.example.plugin.action",
  "event": "willDisappear",
  "context": "unique-context-id",
  "device": "device-id",
  "payload": {
    "settings": {},
    "coordinates": {
      "column": 0,
      "row": 0
    },
    "state": 0,
    "isInMultiAction": false
  }
}
```
Sent when an action disappears from the Stream Deck.

### titleParametersDidChange
```javascript
{
  "action": "com.example.plugin.action",
  "event": "titleParametersDidChange",
  "context": "unique-context-id",
  "device": "device-id",
  "payload": {
    "settings": {},
    "coordinates": {
      "column": 0,
      "row": 0
    },
    "state": 0,
    "title": "New Title",
    "titleParameters": {
      "fontFamily": "",
      "fontSize": 9,
      "fontStyle": "",
      "fontUnderline": false,
      "showTitle": true,
      "titleAlignment": "middle",
      "titleColor": "#ffffff"
    }
  }
}
```
Sent when the title or title parameters change.

### didReceiveSettings
```javascript
{
  "action": "com.example.plugin.action",
  "event": "didReceiveSettings",
  "context": "unique-context-id",
  "device": "device-id",
  "payload": {
    "settings": {
      "customSetting": "value"
    },
    "coordinates": {
      "column": 0,
      "row": 0
    },
    "isInMultiAction": false
  }
}
```
Sent when settings are requested or changed.

### didReceiveGlobalSettings
```javascript
{
  "event": "didReceiveGlobalSettings",
  "payload": {
    "settings": {
      "globalSetting": "value"
    }
  }
}
```
Sent when global settings are requested or changed.

### propertyInspectorDidAppear
```javascript
{
  "action": "com.example.plugin.action",
  "event": "propertyInspectorDidAppear",
  "context": "unique-context-id",
  "device": "device-id"
}
```
Sent when the property inspector appears.

### propertyInspectorDidDisappear
```javascript
{
  "action": "com.example.plugin.action",
  "event": "propertyInspectorDidDisappear",
  "context": "unique-context-id",
  "device": "device-id"
}
```
Sent when the property inspector disappears.

## Plugin to Stream Deck Methods

### setSettings
```javascript
websocket.send(JSON.stringify({
  "event": "setSettings",
  "context": context,
  "payload": {
    "customSetting": "value"
  }
}));
```
Save settings for an action instance.

### getSettings
```javascript
websocket.send(JSON.stringify({
  "event": "getSettings",
  "context": context
}));
```
Request the settings for an action instance.

### setGlobalSettings
```javascript
websocket.send(JSON.stringify({
  "event": "setGlobalSettings",
  "context": pluginUUID,
  "payload": {
    "globalSetting": "value"
  }
}));
```
Save global settings for the plugin.

### getGlobalSettings
```javascript
websocket.send(JSON.stringify({
  "event": "getGlobalSettings",
  "context": pluginUUID
}));
```
Request the global settings for the plugin.

### openUrl
```javascript
websocket.send(JSON.stringify({
  "event": "openUrl",
  "payload": {
    "url": "https://example.com"
  }
}));
```
Open a URL in the default browser.

### logMessage
```javascript
websocket.send(JSON.stringify({
  "event": "logMessage",
  "payload": {
    "message": "Debug message"
  }
}));
```
Write a message to the Stream Deck log file.

### setTitle
```javascript
websocket.send(JSON.stringify({
  "event": "setTitle",
  "context": context,
  "payload": {
    "title": "New Title",
    "target": 0 // 0 = hardware and software, 1 = hardware only, 2 = software only
  }
}));
```
Set the title of an action instance.

### setImage
```javascript
websocket.send(JSON.stringify({
  "event": "setImage",
  "context": context,
  "payload": {
    "image": "data:image/png;base64,iVBORw0KG...", // base64 encoded image or path
    "target": 0,
    "state": 0 // optional, for multi-state actions
  }
}));
```
Set the image of an action instance.

### setState
```javascript
websocket.send(JSON.stringify({
  "event": "setState",
  "context": context,
  "payload": {
    "state": 1 // 0 or 1 for toggle actions
  }
}));
```
Change the state of an action (for multi-state actions).

### showAlert
```javascript
websocket.send(JSON.stringify({
  "event": "showAlert",
  "context": context
}));
```
Show an alert (exclamation mark) on the key temporarily.

### showOk
```javascript
websocket.send(JSON.stringify({
  "event": "showOk",
  "context": context
}));
```
Show an OK (checkmark) on the key temporarily.

### sendToPropertyInspector
```javascript
websocket.send(JSON.stringify({
  "event": "sendToPropertyInspector",
  "action": action,
  "context": context,
  "payload": {
    "customData": "value"
  }
}));
```
Send data to the property inspector.

### sendToPlugin
```javascript
// From property inspector
websocket.send(JSON.stringify({
  "event": "sendToPlugin",
  "action": action,
  "context": context,
  "payload": {
    "customData": "value"
  }
}));
```
Send data from the property inspector to the plugin.

### switchToProfile
```javascript
websocket.send(JSON.stringify({
  "event": "switchToProfile",
  "context": pluginUUID,
  "device": device,
  "payload": {
    "profile": "ProfileName"
  }
}));
```
Switch to a specific profile on a device.

## Device Types

- `0` - Stream Deck (15 keys: 5x3)
- `1` - Stream Deck Mini (6 keys: 3x2)
- `2` - Stream Deck XL (32 keys: 8x4)
- `3` - Stream Deck Mobile
- `4` - Corsair GKeys

## Image Formats

Images can be provided as:
- Base64 encoded string: `data:image/png;base64,iVBORw0KG...`
- Relative path to an image in the plugin bundle: `images/icon.png`
- SVG as base64: `data:image/svg+xml;charset=utf8,<svg>...</svg>`

Recommended image sizes:
- Stream Deck: 72x72 pixels
- Stream Deck Mini: 80x80 pixels  
- Stream Deck XL: 96x96 pixels

For best quality, provide images at 144x144 pixels (2x resolution).
