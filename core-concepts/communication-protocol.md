# Communication Protocol

## Overview

Stream Deck plugins communicate via WebSocket using JSON messages. The Stream Deck application acts as a message broker between the plugin (Node.js) and property inspector (Chromium).

## WebSocket Connection

### Plugin Connection

```typescript
import streamDeck from "@elgato/streamdeck";

// Automatic connection handling
streamDeck.connect();
```

The SDK handles:
- Port discovery
- Registration
- Keep-alive
- Reconnection

### Property Inspector Connection

```javascript
window.connectElgatoStreamDeckSocket = (port, uuid, event, info, actionInfo) => {
    // Called by Stream Deck to establish connection
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    
    ws.onopen = () => {
        // Register with Stream Deck
        ws.send(JSON.stringify({
            event: event,
            uuid: uuid
        }));
    };
};
```

With sdpi-components, this is automatic:

```javascript
const { streamDeckClient } = SDPIComponents;
// Already connected and registered
```

## Message Format

### From Plugin to Stream Deck

```typescript
{
    "event": "setTitle",
    "context": "action-instance-id",
    "payload": {
        "title": "Hello",
        "target": 0
    }
}
```

### From Stream Deck to Plugin

```typescript
{
    "event": "keyDown",
    "action": "com.company.plugin.action",
    "context": "action-instance-id",
    "device": "device-id",
    "payload": {
        "settings": {},
        "coordinates": { "column": 0, "row": 0 },
        "state": 0
    }
}
```

## Plugin Events

### Received by Plugin

**keyDown**: Key pressed
```typescript
{
    "event": "keyDown",
    "action": "com.company.action",
    "context": "uuid",
    "device": "device-id",
    "payload": {
        "settings": {},
        "coordinates": { "column": 2, "row": 1 },
        "state": 0,
        "isInMultiAction": false
    }
}
```

**keyUp**: Key released
**dialRotate**: Dial rotated  
**dialDown**: Dial pressed
**dialUp**: Dial released
**touchTap**: Touchscreen tapped
**willAppear**: Action appears
**willDisappear**: Action disappears
**didReceiveSettings**: Settings updated
**propertyInspectorDidAppear**: UI opened
**propertyInspectorDidDisappear**: UI closed
**sendToPlugin**: Message from property inspector

### Sent by Plugin

**setTitle**: Change title
```typescript
{
    "event": "setTitle",
    "context": "action-instance-id",
    "payload": {
        "title": "New Title",
        "target": 0  // 0 = hardware and software, 1 = hardware only, 2 = software only
    }
}
```

**setImage**: Change image
```typescript
{
    "event": "setImage",
    "context": "action-instance-id",
    "payload": {
        "image": "data:image/png;base64,...",
        "target": 0
    }
}
```

**setState**: Change state (multi-state actions)
```typescript
{
    "event": "setState",
    "context": "action-instance-id",
    "payload": {
        "state": 1
    }
}
```

**showAlert**: Show error indicator
**showOk**: Show success indicator
**setSettings**: Save action settings
**getSettings**: Request action settings
**setGlobalSettings**: Save global settings
**getGlobalSettings**: Request global settings
**sendToPropertyInspector**: Send message to UI

## Property Inspector Events

### Received by Property Inspector

**sendToPropertyInspector**: Message from plugin
```typescript
{
    "event": "sendToPropertyInspector",
    "action": "com.company.action",
    "context": "uuid",
    "payload": {
        // Custom data
    }
}
```

**didReceiveSettings**: Settings updated
```typescript
{
    "event": "didReceiveSettings",
    "action": "com.company.action",
    "context": "uuid",
    "payload": {
        "settings": {
            // Current settings
        }
    }
}
```

**didReceiveGlobalSettings**: Global settings updated

### Sent by Property Inspector

**setSettings**: Save settings
```typescript
{
    "event": "setSettings",
    "context": "action-instance-id",
    "payload": {
        // Settings object
    }
}
```

**sendToPlugin**: Send message to plugin
```typescript
{
    "event": "sendToPlugin",
    "action": "com.company.action",
    "context": "uuid",
    "payload": {
        // Custom data
    }
}
```

## Plugin-to-UI Communication

### Send from Plugin

```typescript
override async onKeyDown(ev: KeyDownEvent) {
    await ev.action.sendToPropertyInspector({
        message: "Hello from plugin",
        data: { count: 5 }
    });
}
```

### Receive in Property Inspector

```javascript
const { streamDeckClient } = SDPIComponents;

streamDeckClient.on('sendToPropertyInspector', (payload) => {
    console.log(payload.message); // "Hello from plugin"
    console.log(payload.data.count); // 5
});
```

### Send from Property Inspector

```javascript
const { streamDeckClient } = SDPIComponents;

await streamDeckClient.send({
    event: 'sendToPlugin',
    payload: {
        message: "Hello from UI",
        action: "doSomething"
    }
});
```

### Receive in Plugin

```typescript
override async onSendToPlugin(ev: SendToPluginEvent) {
    const { message, action } = ev.payload;
    console.log(message); // "Hello from UI"
    
    if (action === "doSomething") {
        // Handle action
    }
}
```

## Context Identifiers

Every action instance has unique identifiers:

```typescript
{
    "action": "com.company.plugin.action",  // Action UUID
    "context": "B8E3D9A...",                // Instance UUID
    "device": "4F30E1B..."                  // Device UUID
}
```

Use `context` to target specific action instances.

## Device Information

```typescript
{
    "device": "4F30E1B...",
    "deviceInfo": {
        "name": "Stream Deck",
        "type": 0,  // Device type
        "size": {
            "columns": 5,
            "rows": 3
        }
    }
}
```

## Error Handling

### Connection Errors

```typescript
streamDeck.client.on('error', (error) => {
    streamDeck.logger.error(`WebSocket error: ${error.message}`);
});

streamDeck.client.on('close', () => {
    streamDeck.logger.warn('WebSocket closed');
    // SDK will auto-reconnect
});
```

### Message Validation

```typescript
override async onSendToPlugin(ev: SendToPluginEvent) {
    try {
        const payload = ev.payload as MyPayload;
        
        if (!payload.requiredField) {
            throw new Error('Missing required field');
        }
        
        // Process message
    } catch (error) {
        streamDeck.logger.error(`Invalid message: ${error.message}`);
    }
}
```

## Rate Limiting

Stream Deck enforces rate limits:
- **setImage**: Max 10 per second per action
- **setTitle**: Max 10 per second per action
- Exceeding limits causes dropped messages

Best practices:
- Debounce frequent updates
- Batch updates when possible
- Use requestAnimationFrame for animations

## Deep Links

Plugins can receive deep-link messages:

```
streamdeck://plugins/message/<PLUGIN_UUID>/<MESSAGE>
```

```typescript
streamDeck.system.onDidReceiveDeepLink((ev) => {
    const url = ev.payload.url;
    // Parse and handle message
});
```

## Best Practices

1. **Use SDK**: Let SDK handle WebSocket complexity
2. **Validate Messages**: Check payload structure
3. **Handle Errors**: Graceful error handling
4. **Rate Limit**: Respect Stream Deck limits
5. **Type Safety**: Define message types
6. **Test Connection**: Handle disconnections
7. **Log Issues**: Use SDK logger
