# API Reference

## streamDeck

The main Stream Deck SDK instance.

### streamDeck.actions

Manages plugin actions.

**registerAction(action: SingletonAction): void**
Register an action with Stream Deck.

**forEach(callback: (action: Action) => void): void**
Iterate over all visible actions.

**on[Event](handler: (ev: Event) => void): void**
Subscribe to action events.

### streamDeck.connect()

Establishes WebSocket connection with Stream Deck. Must be called after registering all actions.

```typescript
streamDeck.actions.registerAction(new MyAction());
streamDeck.connect();
```

### streamDeck.logger

Logging interface.

**trace(message: string): void**
**debug(message: string): void**
**info(message: string): void**
**warn(message: string): void**
**error(message: string): void**

### streamDeck.settings

Global settings management.

`setGlobalSettings<T>(settings: T): Promise<void>`
Save global settings.

`getGlobalSettings<T>(): Promise<T>`
Retrieve global settings.

**onDidReceiveGlobalSettings(handler: (ev) => void): void**
Listen for global settings changes.

### streamDeck.system

System utilities.

**openUrl(url: string): Promise<void>**
Open URL in default browser.

**onDidReceiveDeepLink(handler: (ev) => void): void**
Receive deep-link messages.

### streamDeck.devices

Device management.

**forEach(callback: (device: Device) => void): void**
Iterate over connected devices.

**onDeviceDidConnect(handler: (ev) => void): void**
Device connected event.

**onDeviceDidDisconnect(handler: (ev) => void): void**
Device disconnected event.

## SingletonAction

Base class for actions.

### Event Handlers

**onWillAppear(ev: WillAppearEvent): void | Promise<void>**
Action appears on Stream Deck.

**onWillDisappear(ev: WillDisappearEvent): void | Promise<void>**
Action disappears from Stream Deck.

**onKeyDown(ev: KeyDownEvent): void | Promise<void>**
Key pressed.

**onKeyUp(ev: KeyUpEvent): void | Promise<void>**
Key released.

**onDialRotate(ev: DialRotateEvent): void | Promise<void>**
Dial rotated (Stream Deck +).

**onDialDown(ev: DialDownEvent): void | Promise<void>**
Dial pressed.

**onDialUp(ev: DialUpEvent): void | Promise<void>**
Dial released.

**onTouchTap(ev: TouchTapEvent): void | Promise<void>**
Touchscreen tapped.

**onDidReceiveSettings(ev: DidReceiveSettingsEvent): void | Promise<void>**
Settings updated.

**onPropertyInspectorDidAppear(ev): void | Promise<void>**
Property inspector opened.

**onPropertyInspectorDidDisappear(ev): void | Promise<void>**
Property inspector closed.

**onSendToPlugin(ev: SendToPluginEvent): void | Promise<void>**
Message from property inspector.

## Action

Individual action instance.

### Properties

**id: string** - Instance identifier
**manifestId: string** - Action UUID from manifest
**device: Device** - Associated device

### Methods

**setTitle(title: string, target?: Target): Promise<void>**
Set action title.

**setImage(image: string, target?: Target): Promise<void>**
Set action image (base64 or file path).

**setState(state: number): Promise<void>**
Set action state (multi-state actions).

`setSettings<T>(settings: T): Promise<void>`
Save action settings.

`getSettings<T>(): Promise<T>`
Retrieve action settings.

**showAlert(): Promise<void>**
Show error indicator.

**showOk(): Promise<void>**
Show success indicator.

**sendToPropertyInspector(payload: unknown): Promise<void>**
Send message to property inspector.

**isKey(): boolean**
Check if action is key-type.

**isDial(): boolean**
Check if action is dial-type.

**setFeedback(feedback: Feedback): Promise<void>**
Set dial feedback (Stream Deck +).

**setFeedbackLayout(layout: string): Promise<void>**
Set dial layout.

## Types

### Target

```typescript
enum Target {
    HardwareAndSoftware = 0,
    HardwareOnly = 1,
    SoftwareOnly = 2
}
```

### Controller

```typescript
type Controller = "Keypad" | "Encoder";
```

### Device

```typescript
interface Device {
    id: string;
    name: string;
    type: number;
    size: {
        columns: number;
        rows: number;
    };
    isConnected: boolean;
}
```

### Settings Events

**KeyDownEvent<TSettings>**
**KeyUpEvent<TSettings>**
**WillAppearEvent<TSettings>**
**WillDisappearEvent<TSettings>**
**DidReceiveSettingsEvent<TSettings>**

All events include:
- `action: Action`
- `context: string`
- `device: Device`
- `payload: { settings: TSettings, ... }`

## Property Inspector API

### streamDeckClient

```javascript
const { streamDeckClient } = SDPIComponents;
```

**setSettings(settings: object): Promise<void>**
Save action settings.

**getSettings(): Promise<object>**
Get current settings.

**setGlobalSettings(settings: object): Promise<void>**
Save global settings.

**getGlobalSettings(): Promise<object>**
Get global settings.

**send(message: object): Promise<void>**
Send custom message to plugin.

**on(event: string, handler: Function): void**
Subscribe to events.

## Manifest Reference

See manifest-templates.md for complete manifest schema.

## Complete Example

```typescript
import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent
} from "@elgato/streamdeck";

type Settings = {
    count: number;
};

@action({ UUID: "com.company.plugin.counter" })
class Counter extends SingletonAction<Settings> {
    override async onWillAppear(ev: WillAppearEvent<Settings>) {
        const { count = 0 } = ev.payload.settings;
        await ev.action.setTitle(`${count}`);
    }
    
    override async onKeyDown(ev: KeyDownEvent<Settings>) {
        let { count = 0 } = ev.payload.settings;
        count++;
        
        await ev.action.setSettings({ count });
        await ev.action.setTitle(`${count}`);
    }
}

streamDeck.actions.registerAction(new Counter());
streamDeck.connect();
```

