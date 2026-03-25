# API Reference

## streamDeck

The main Stream Deck SDK instance. Import from `@elgato/streamdeck`.

```typescript
import streamDeck from "@elgato/streamdeck";
// or named imports:
import streamDeck, { action, SingletonAction, KeyDownEvent } from "@elgato/streamdeck";
```

---

## streamDeck.actions

Manages plugin actions and provides access to all visible action instances.

### Methods

**`registerAction(action: SingletonAction): void`**
Register an action class with Stream Deck. Must be called before `streamDeck.connect()`.

```typescript
streamDeck.actions.registerAction(new CounterAction());
```

**`forEach(callback: (action: Action) => void): void`**
Iterate over all currently visible action instances across all connected devices.

```typescript
streamDeck.actions.forEach((action) => {
    action.setTitle("Updated");
});
```

### Action Events (on `streamDeck.actions`)

These listeners fire for *all* actions (any UUID), unlike `SingletonAction` overrides which fire for a specific action type.

**`onWillAppear(handler: (ev: ActionEvent<WillAppearPayload>) => void): void`**
**`onWillDisappear(handler: (ev: ActionEvent<WillDisappearPayload>) => void): void`**
**`onKeyDown(handler: (ev: ActionEvent<KeyDownPayload>) => void): void`**
**`onKeyUp(handler: (ev: ActionEvent<KeyUpPayload>) => void): void`**
**`onDialRotate(handler: (ev: ActionEvent<DialRotatePayload>) => void): void`**
**`onDialDown(handler: (ev: ActionEvent<DialDownPayload>) => void): void`**
**`onDialUp(handler: (ev: ActionEvent<DialUpPayload>) => void): void`**
**`onTouchTap(handler: (ev: ActionEvent<TouchTapPayload>) => void): void`**
**`onDidReceiveSettings(handler: (ev: ActionEvent<DidReceiveSettingsPayload>) => void): void`**

---

## streamDeck.connect()

Establishes the WebSocket connection with Stream Deck and begins processing events. Must be called after all actions are registered.

```typescript
streamDeck.actions.registerAction(new MyAction());
streamDeck.connect();
```

---

## streamDeck.devices

Provides access to connected Stream Deck devices.

### Methods

**`forEach(callback: (device: Device) => void): void`**
Iterate over all known devices (connected and disconnected).

```typescript
streamDeck.devices.forEach((device) => {
    console.log(device.name, device.isConnected);
});
```

### Events

**`onDeviceDidConnect(handler: (ev: DeviceEvent) => void): void`**
Fires when a device is connected (including devices already connected at startup).

**`onDeviceDidDisconnect(handler: (ev: DeviceEvent) => void): void`**
Fires when a device is disconnected.

```typescript
streamDeck.devices.onDeviceDidConnect((ev) => {
    streamDeck.logger.info(`Device connected: ${ev.device.name}`);
});
```

---

## streamDeck.logger

Levelled logging. All output is written to the Stream Deck log file.

```typescript
streamDeck.logger.trace("Verbose detail");
streamDeck.logger.debug("Debug info");
streamDeck.logger.info("Plugin started");
streamDeck.logger.warn("Deprecated usage");
streamDeck.logger.error("Operation failed:", error);
```

**`createScope(name: string): Logger`**
Create a scoped logger that prefixes all messages with `[name]`:

```typescript
const logger = streamDeck.logger.createScope("AuthService");
logger.info("Token refreshed"); // logs: [AuthService] Token refreshed
```

---

## streamDeck.settings

Plugin-level global settings (shared across all action instances).

**`setGlobalSettings<T>(settings: T): Promise<void>`**
Persist global settings. Stored by Stream Deck; survives plugin restarts.

**`getGlobalSettings<T>(): Promise<T>`**
Retrieve global settings.

**`onDidReceiveGlobalSettings(handler: (ev: GlobalSettingsEvent<T>) => void): void`**
Fires when global settings are changed (from any action or PI).

```typescript
interface GlobalSettings { apiKey?: string; theme?: string; }

// Write
await streamDeck.settings.setGlobalSettings<GlobalSettings>({ apiKey: "abc123" });

// Read
const settings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
const key = settings.apiKey ?? "";

// Listen
streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((ev) => {
    applyTheme(ev.payload.settings.theme);
});
```

---

## streamDeck.system

System-level utilities.

**`openUrl(url: string): Promise<void>`**
Open a URL in the user's default browser.

```typescript
await streamDeck.system.openUrl("https://example.com/help");
```

**`onDidReceiveDeepLink(handler: (ev: DeepLinkEvent) => void): void`**
Receive deep-link messages sent to the plugin via `streamdeck://plugins/message/<UUID>?...`

```typescript
streamDeck.system.onDidReceiveDeepLink((ev) => {
    const url = new URL(ev.payload.url);
    const action = url.searchParams.get("action");
    handleDeepLink(action);
});
```

---

## streamDeck.profiles

Profile management.

**`switchToProfile(profileName: string, device?: string, pageIndex?: number): Promise<void>`**
Switch the active profile on a device. `profileName` must match a profile name defined in the manifest.

```typescript
// Switch to a named profile on the first device
streamDeck.devices.forEach(async (device) => {
    if (device.isConnected) {
        await streamDeck.profiles.switchToProfile("Game Mode", device.id);
    }
});
```

---

## streamDeck.ui

Manages the Property Inspector (PI) state.

**`current: PropertyInspector | undefined`**
The currently open Property Inspector instance, if any.

```typescript
if (streamDeck.ui.current) {
    // PI is open
    await streamDeck.ui.current.sendToPropertyInspector({ status: "ready" });
}
```

**`onDidAppear(handler: (ev: PropertyInspectorEvent) => void): void`**
Fires when a Property Inspector becomes visible.

**`onDidDisappear(handler: (ev: PropertyInspectorEvent) => void): void`**
Fires when a Property Inspector is closed.

---

## SingletonAction\<TSettings\>

Base class for all plugin actions. Extend this and decorate with `@action`.

```typescript
import { action, SingletonAction } from "@elgato/streamdeck";

type Settings = { count: number };

@action({ UUID: "com.example.plugin.counter" })
export class CounterAction extends SingletonAction<Settings> {
    // Override event handlers as needed
}
```

### `@action` Decorator

```typescript
@action({ UUID: "com.example.plugin.myaction" })
```

The `UUID` must match the action's UUID in `manifest.json`. It must be globally unique (reverse-domain format recommended).

### Event Handler Overrides

Override any of these methods. All are optional and can be `async`.

**`onWillAppear(ev: WillAppearEvent<TSettings>): void | Promise<void>`**
Action is visible on a Stream Deck. Use this to set initial state.

**`onWillDisappear(ev: WillDisappearEvent<TSettings>): void | Promise<void>`**
Action is no longer visible (profile switch, etc.). Clean up timers, subscriptions.

**`onKeyDown(ev: KeyDownEvent<TSettings>): void | Promise<void>`**
A key is pressed.

**`onKeyUp(ev: KeyUpEvent<TSettings>): void | Promise<void>`**
A key is released.

**`onDialRotate(ev: DialRotateEvent<TSettings>): void | Promise<void>`**
A dial is rotated (Stream Deck + only). `ev.payload.ticks`: positive = clockwise.

**`onDialDown(ev: DialDownEvent<TSettings>): void | Promise<void>`**
A dial is pressed down.

**`onDialUp(ev: DialUpEvent<TSettings>): void | Promise<void>`**
A dial is released.

**`onTouchTap(ev: TouchTapEvent<TSettings>): void | Promise<void>`**
The touchstrip is tapped. `ev.payload.hold`: `true` for long press.

**`onDidReceiveSettings(ev: DidReceiveSettingsEvent<TSettings>): void | Promise<void>`**
Settings for this action were updated (from PI or another plugin action). Typically used to re-render.

**`onPropertyInspectorDidAppear(ev: PropertyInspectorDidAppearEvent<TSettings>): void | Promise<void>`**
The PI for this action was opened. Good time to push current state.

**`onPropertyInspectorDidDisappear(ev: PropertyInspectorDidDisappearEvent<TSettings>): void | Promise<void>`**
The PI was closed.

**`onSendToPlugin(ev: SendToPluginEvent<TPayload, TSettings>): void | Promise<void>`**
A message was sent from the PI via `streamDeckClient.send(payload)`.

---

## Action

Individual action instance passed in event objects as `ev.action`.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique instance identifier (context) |
| `manifestId` | `string` | UUID from manifest (e.g. `"com.example.plugin.counter"`) |
| `device` | `Device` | Device this action is on |
| `coordinates` | `Coordinates \| undefined` | `{ column, row }` position on the device |
| `isKey()` | `() => boolean` | True if this action is a Keypad-type action |
| `isDial()` | `() => boolean` | True if this action is an Encoder-type action |

### Methods

**`setTitle(title: string, target?: Target): Promise<void>`**
Set the title displayed on the key. `target` defaults to `Target.HardwareAndSoftware`.

**`setImage(image: string, target?: Target, state?: number): Promise<void>`**
Set the image. `image` may be:
- A base64 PNG string (without the `data:image/...;base64,` prefix)
- A full data URL: `data:image/png;base64,...`
- An SVG data URL: `data:image/svg+xml;base64,...`
- A relative path to an image in the plugin bundle (without extension)

**`setState(state: number): Promise<void>`**
Set the active state for multi-state actions (0-indexed).

**`setSettings<T>(settings: T): Promise<void>`**
Persist settings for this action instance.

**`getSettings<T>(): Promise<T>`**
Retrieve persisted settings for this action instance.

**`showAlert(): Promise<void>`**
Flash the ⚠️ error indicator on the key.

**`showOk(): Promise<void>`**
Flash the ✓ success indicator on the key.

**`sendToPropertyInspector(payload: unknown): Promise<void>`**
Send an arbitrary payload to the PI. The PI receives it via `streamDeckClient.on("sendToPropertyInspector", ...)`.

**`setFeedback(feedback: Partial<FeedbackPayload>): Promise<void>`**
Update the dial/touchstrip layout content (Stream Deck + and Neo only).

**`setFeedbackLayout(layout: string): Promise<void>`**
Change the active layout template for the dial display. Built-in layouts: `"$B1"`, `"$B2"`, `"$A0"`, `"$A1"`, `"$C1"`, `"$X1"`.

---

## Types and Enums

### Target

Controls which surface(s) are updated.

```typescript
enum Target {
    HardwareAndSoftware = 0, // Update both device LCD and software UI
    HardwareOnly        = 1, // Update device LCD only
    SoftwareOnly        = 2, // Update software UI only
}
```

### Controller

```typescript
type Controller = "Keypad" | "Encoder";
```

### DeviceType

```typescript
enum DeviceType {
    StreamDeck       = 0,  // Classic MK.2 — 15 keys (5×3), 72×72 px icons
    StreamDeckMini   = 1,  // Mini — 6 keys (3×2), 80×80 px icons
    StreamDeckXL     = 2,  // XL — 32 keys (8×4), 96×96 px icons
    StreamDeckMobile = 3,  // Mobile app (iOS/Android)
    StreamDeckPedal  = 5,  // Pedal — 3 foot pedals, no display
    StreamDeckPlus   = 7,  // Plus — 8 keys + 4 dials, 200×100 px icons
    StreamDeckNeo    = 8,  // Neo — 8 keys + info panel, 96×96 px icons
}
```

### Device

```typescript
interface Device {
    id: string;            // Unique device identifier
    name: string;          // Human-readable name (e.g. "Stream Deck XL")
    type: DeviceType;      // Hardware type
    size: {
        columns: number;   // Number of key columns
        rows: number;      // Number of key rows
    };
    isConnected: boolean;
}
```

### Coordinates

```typescript
interface Coordinates {
    column: number;  // 0-indexed column
    row: number;     // 0-indexed row
}
```

### Event Payload Shapes

All action events include these common fields:

```typescript
interface BaseActionPayload<TSettings> {
    settings: TSettings;    // Current action settings
    coordinates?: Coordinates;
    isInMultiAction: boolean;
    state?: number;         // Current state index (multi-state actions)
}
```

**KeyDownPayload / KeyUpPayload** — inherits `BaseActionPayload`

**WillAppearPayload / WillDisappearPayload**:
```typescript
interface WillAppearPayload<TSettings> extends BaseActionPayload<TSettings> {
    controller: Controller; // "Keypad" or "Encoder"
}
```

**DialRotatePayload**:
```typescript
interface DialRotatePayload<TSettings> extends BaseActionPayload<TSettings> {
    ticks: number;    // Rotation amount; positive = clockwise
    pressed: boolean; // True if dial was pressed while rotating
}
```

**TouchTapPayload**:
```typescript
interface TouchTapPayload<TSettings> extends BaseActionPayload<TSettings> {
    hold: boolean;    // True for long tap/press
    tapPos: [number, number]; // [x, y] position on touchstrip
}
```

**FeedbackPayload** (for `setFeedback`):
```typescript
interface FeedbackPayload {
    title?: string;
    value?: string | number;
    indicator?: { value: number; enabled: boolean };
    icon?: string;       // Base64 or data URL
    "full-canvas"?: string; // Base64 full layout override
    bar?: { value: number };
}
```

---

## Property Inspector API

The PI communicates with the plugin via the `SDPIComponents` library.

### Setup

```html
<script src="https://cdn.jsdelivr.net/npm/@elgato-stream-deck/sdpi-components@3/dist/index.js"></script>
```

### `streamDeckClient`

```javascript
const { streamDeckClient } = window.SDPIComponents;
```

| Method | Description |
|--------|-------------|
| `getSettings(): Promise<object>` | Get current action settings |
| `setSettings(settings: object): Promise<void>` | Save action settings |
| `getGlobalSettings(): Promise<object>` | Get global settings |
| `setGlobalSettings(settings: object): Promise<void>` | Save global settings |
| `send(payload: object): Promise<void>` | Send message to plugin (`onSendToPlugin`) |
| `on(event: string, handler: Function): void` | Subscribe to an event |

### PI Events

```javascript
// Receive settings
streamDeckClient.on("didReceiveSettings", (ev) => {
    applySettings(ev.payload.settings);
});

// Receive message from plugin
streamDeckClient.on("sendToPropertyInspector", (payload) => {
    handlePluginMessage(payload);
});

// Settings changed externally
streamDeckClient.on("didReceiveGlobalSettings", (ev) => {
    applyGlobalSettings(ev.payload.settings);
});
```

---

## Manifest Reference

Key fields in `manifest.json`:

```json
{
    "Name": "Plugin Display Name",
    "Version": "1.0.0.0",
    "Author": "Author Name",
    "Description": "What this plugin does",
    "Category": "Category Name",
    "CategoryIcon": "images/category",
    "CodePath": "bin/plugin.js",
    "Icon": "images/plugin",
    "URL": "https://example.com",
    "Nodejs": {
        "Version": "20",
        "Debug": "enabled"
    },
    "Actions": [
        {
            "Name": "Action Display Name",
            "UUID": "com.example.plugin.actionname",
            "Icon": "images/action",
            "Controllers": ["Keypad"],
            "DisableAutomaticIdentifiers": false,
            "States": [
                {
                    "Image": "images/action",
                    "TitleAlignment": "middle",
                    "FontSize": "12",
                    "FontStyle": "Regular",
                    "FontUnderline": false,
                    "ShowTitle": true,
                    "Title": ""
                }
            ],
            "PropertyInspectorPath": "src/property-inspector.html",
            "Tooltip": "Shown on hover in the SD app",
            "VisibleInActionsList": true
        }
    ],
    "OS": [
        { "Platform": "windows", "MinimumVersion": "10" },
        { "Platform": "mac", "MinimumVersion": "10.15" }
    ]
}
```

### Encoder Action Fields (Stream Deck + / Neo)

```json
{
    "UUID": "com.example.plugin.dialaction",
    "Controllers": ["Keypad", "Encoder"],
    "Encoder": {
        "layout": "$B1",
        "TriggerDescription": {
            "Rotate": "Adjust value",
            "Push": "Reset to default",
            "Touch": "Tap to activate",
            "LongTouch": "Hold for settings"
        }
    }
}
```

---

## Complete Example

```typescript
import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
    WillDisappearEvent,
    DidReceiveSettingsEvent,
    SendToPluginEvent,
    Target,
} from "@elgato/streamdeck";

interface Settings {
    schemaVersion: number;
    count: number;
    label: string;
}

const DEFAULT: Settings = { schemaVersion: 1, count: 0, label: "Count" };

@action({ UUID: "com.example.plugin.counter" })
class Counter extends SingletonAction<Settings> {
    private refreshTimer?: NodeJS.Timeout;

    override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
        const settings = { ...DEFAULT, ...ev.payload.settings };
        await this.render(ev.action, settings);
    }

    override onWillDisappear(_ev: WillDisappearEvent<Settings>): void {
        clearInterval(this.refreshTimer);
    }

    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const settings = { ...DEFAULT, ...ev.payload.settings };
        settings.count++;
        await ev.action.setSettings(settings);
        await this.render(ev.action, settings);
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
        await this.render(ev.action, { ...DEFAULT, ...ev.payload.settings });
    }

    override async onPropertyInspectorDidAppear(ev: any): Promise<void> {
        await ev.action.sendToPropertyInspector({
            type: "current-value",
            count: ev.payload.settings.count ?? 0,
        });
    }

    override async onSendToPlugin(ev: SendToPluginEvent<{ command: string }, Settings>): Promise<void> {
        if (ev.payload.command === "reset") {
            const settings = { ...DEFAULT, ...ev.payload.settings, count: 0 };
            await ev.action.setSettings(settings);
            await this.render(ev.action, settings);
        }
    }

    private async render(action: any, settings: Settings): Promise<void> {
        await action.setTitle(`${settings.label}\n${settings.count}`, Target.HardwareAndSoftware);
    }
}

streamDeck.actions.registerAction(new Counter());
streamDeck.connect();
```
