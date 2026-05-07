# API Reference

This reference tracks `@elgato/streamdeck` 2.1.0 from the official `elgatosf/streamdeck` repository. For new plugin authoring, use Node.js 24 or higher and Stream Deck 7.1 or higher. The npm package declares `engines.node >=20.5.1`, so older SDK v2 projects may still build on Node.js 20, but new examples should target Node.js 24.

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
**`onDidReceiveResources(handler: (ev: ActionEvent<DidReceiveResourcesPayload>) => void): void`**
**`onTitleParametersDidChange(handler: (ev: ActionEvent<TitleParametersDidChangePayload>) => void): void`**

---

## streamDeck.connect()

Establishes the WebSocket connection with Stream Deck and begins processing events. Must be called after all actions are registered. Returns `Promise<void>`.

```typescript
streamDeck.actions.registerAction(new MyAction());
await streamDeck.connect();
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

**`onDeviceDidChange(handler: (ev: DeviceEvent) => void): void`**
Fires when a device name or size changes. Available from Stream Deck 7.0.

```typescript
streamDeck.devices.onDeviceDidConnect((ev) => {
    streamDeck.logger.info(`Device connected: ${ev.device.name}`);
});
```

---

## streamDeck.i18n

Localization provider created from the Stream Deck application language and the plugin's locale files.

```typescript
const label = streamDeck.i18n.translate("actions.counter.title");
```

---

## streamDeck.info

Registration and application information supplied by Stream Deck during initialization, excluding the device list. Device access is available through `streamDeck.devices`.

```typescript
streamDeck.logger.info(`Running on Stream Deck ${streamDeck.info.application.version}`);
streamDeck.logger.info(`Plugin UUID: ${streamDeck.info.plugin.uuid}`);
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

**`useExperimentalMessageIdentifiers: boolean`**
Available from Stream Deck 7.1. When enabled, settings requests include message identifiers. Responses to explicit `getSettings()` and `getGlobalSettings()` calls are not re-emitted through did-receive settings listeners, and action settings can be served from the SDK cache when available.

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

**`onApplicationDidLaunch(handler: (ev: ApplicationDidLaunchEvent) => void): void`**
Fires when an application listed in `ApplicationsToMonitor` launches.

**`onApplicationDidTerminate(handler: (ev: ApplicationDidTerminateEvent) => void): void`**
Fires when an application listed in `ApplicationsToMonitor` terminates.

**`openUrl(url: string): Promise<void>`**
Open a URL in the user's default browser.

```typescript
await streamDeck.system.openUrl("https://example.com/help");
```

**`onDidReceiveDeepLink(handler: (ev: DeepLinkEvent) => void): void`**
Receive deep-link messages sent to the plugin via `streamdeck://plugins/message/<UUID>?...`

**`onSystemDidWakeUp(handler: (ev: SystemDidWakeUpEvent) => void): void`**
Fires when the computer wakes from sleep.

**`getSecrets<T>(): Promise<T>`**
Retrieve marketplace-managed plugin secrets. Requires Stream Deck 6.9 or higher and `SDKVersion: 3` in the manifest.

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

**`switchToProfile(deviceId: string, profile?: string, page?: number): Promise<void>`**
Switch the active profile on a device. `profile` must match a profile name defined in the manifest. When `profile` is omitted, Stream Deck switches back to the previous profile. The optional page argument is zero-indexed and requires Stream Deck 6.5 or higher.

```typescript
// Switch to a named profile on the first device
streamDeck.devices.forEach(async (device) => {
    if (device.isConnected) {
        await streamDeck.profiles.switchToProfile(device.id, "Game Mode", 0);
    }
});
```

---

## streamDeck.ui

Manages the Property Inspector (PI) state.

**`action: DialAction | KeyAction | undefined`**
The action associated with the currently visible Property Inspector, if any.

**`sendToPropertyInspector(payload: JsonValue): Promise<void>`**
Send a payload to the currently visible Property Inspector. The call is ignored when no Property Inspector is visible for a plugin action.

```typescript
if (streamDeck.ui.action) {
    // PI is open
    await streamDeck.ui.sendToPropertyInspector({ status: "ready" });
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

**`onDidReceiveResources(ev: DidReceiveResourcesEvent<TSettings>): void | Promise<void>`**
Resources for this action were updated in the Property Inspector. Available from Stream Deck 7.1.

**`onTitleParametersDidChange(ev: TitleParametersDidChangeEvent<TSettings>): void | Promise<void>`**
The user changed title rendering settings in the Stream Deck application.

---

## Action

Individual action instance passed in event objects as `ev.action`.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique instance identifier (context) |
| `manifestId` | `string` | UUID from manifest (e.g. `"com.example.plugin.counter"`) |
| `device` | `Device` | Device this action is on |
| `coordinates` | `Coordinates \| undefined` | Available on `KeyAction` and `DialAction`; `undefined` for keys inside multi-actions |
| `isKey()` | `() => boolean` | True if this action is a Keypad-type action |
| `isDial()` | `() => boolean` | True if this action is an Encoder-type action |

### Methods

**`setTitle(title?: string, options?: TitleOptions): Promise<void>`**
Set the title displayed on a key. `options` may include `target` and `state`. When `title` is `undefined`, the title resets to the user or manifest title.

**`setImage(image?: string, options?: ImageOptions): Promise<void>`**
Set the image. `image` may be:
- A full data URL: `data:image/png;base64,...`
- An SVG data URL: `data:image/svg+xml;base64,...`
- An SVG string
- A relative path to an image in the plugin bundle
- `undefined` to reset to the manifest image

**`setState(state: number): Promise<void>`**
Set the active state for multi-state actions (0-indexed).

**`setSettings<T>(settings: T): Promise<void>`**
Persist settings for this action instance.

**`getSettings<T>(): Promise<T>`**
Retrieve persisted settings for this action instance.

**`getResources(): Promise<Resources>`**
Retrieve files associated with this action instance for profile/action export. Available from Stream Deck 7.1.

**`setResources(resources: Resources): Promise<void>`**
Persist files associated with this action instance for profile/action export. Available from Stream Deck 7.1.

**`showAlert(): Promise<void>`**
Flash the ⚠️ error indicator on the key.

**`showOk(): Promise<void>`**
Flash the ✓ success indicator on the key.

**`setFeedback(feedback: Partial<FeedbackPayload>): Promise<void>`**
Update the dial/touchstrip layout content (Stream Deck + and Neo only).

**`setFeedbackLayout(layout: string): Promise<void>`**
Change the active layout template for the dial display. Built-in layouts: `"$B1"`, `"$B2"`, `"$A0"`, `"$A1"`, `"$C1"`, `"$X1"`.

**`setTriggerDescription(descriptions?: TriggerDescriptionOptions): Promise<void>`**
Update dial rotation, push, touch, and long-touch descriptions in the Stream Deck application.

---

## Types and Enums

### Target

Controls which surface(s) are updated.

```typescript
enum Target {
    HardwareAndSoftware = 0, // Update both device LCD and software UI
    Hardware            = 1, // Update device LCD only
    Software            = 2, // Update software UI only
}
```

### Controller

```typescript
type Controller = "Keypad" | "Encoder";
```

### DeviceType

```typescript
enum DeviceType {
    StreamDeck        = 0,
    StreamDeckMini    = 1,
    StreamDeckXL      = 2,
    StreamDeckMobile  = 3,
    CorsairGKeys      = 4,
    StreamDeckPedal   = 5,
    CorsairVoyager    = 6,
    StreamDeckPlus    = 7,
    SCUFController    = 8,
    StreamDeckNeo     = 9,
    StreamDeckStudio  = 10,
    VirtualStreamDeck = 11,
    Galleon100SD      = 12,
    StreamDeckPlusXL  = 13,
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
    resources?: Resources;  // Embedded resource paths, available from Stream Deck 7.1
    state?: number;         // Current state index (multi-state actions)
}
```

Resources are maps of stable keys to file paths. Stream Deck may rewrite the file paths when an exported action or profile is imported on another machine, but the resource keys and file names remain stable.

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

For production plugins, bundle `sdpi-components.js` locally in the plugin's `ui` folder so the Property Inspector works offline and has a stable component version. The current public docs point to SDPI Components v4.

```html
<script src="sdpi-components.js"></script>
```

During development, the remote v4 script can be useful:

```html
<script src="https://sdpi-components.dev/releases/v4/sdpi-components.js"></script>
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
    "UUID": "com.example.plugin",
    "SDKVersion": 3,
    "Software": {
        "MinimumVersion": "7.1"
    },
    "Nodejs": {
        "Version": "24",
        "Debug": "enabled"
    },
    "Actions": [
        {
            "Name": "Action Display Name",
            "UUID": "com.example.plugin.actionname",
            "Icon": "images/action",
            "Controllers": ["Keypad"],
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
        const settings = await ev.action.getSettings<Settings>();
        await streamDeck.ui.sendToPropertyInspector({
            type: "current-value",
            count: settings.count ?? 0,
        });
    }

    override async onSendToPlugin(ev: SendToPluginEvent<{ command: string }, Settings>): Promise<void> {
        if (ev.payload.command === "reset") {
            const current = await ev.action.getSettings<Settings>();
            const settings = { ...DEFAULT, ...current, count: 0 };
            await ev.action.setSettings(settings);
            await this.render(ev.action, settings);
        }
    }

    private async render(action: any, settings: Settings): Promise<void> {
        await action.setTitle(`${settings.label}\n${settings.count}`, { target: Target.HardwareAndSoftware });
    }
}

streamDeck.actions.registerAction(new Counter());
await streamDeck.connect();
```
