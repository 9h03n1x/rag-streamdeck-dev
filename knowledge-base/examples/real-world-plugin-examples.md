---
category: examples
title: Real-World Plugin Examples
tags: [examples, samples, complete-implementations, advanced-patterns, real-world]
difficulty: intermediate-advanced
sdk-version: v2
related-files: [basic-counter-plugin.md, action-development.md, stream-deck-plus-deep-dive.md]
description: Complete real-world plugin examples from the official Elgato samples repository, demonstrating advanced patterns and industry best practices
---

# Real-World Plugin Examples

## Overview

This guide presents complete, production-quality plugin examples based on the [official Elgato Stream Deck plugin samples](https://github.com/elgatosf/streamdeck-plugin-samples). These examples demonstrate advanced patterns, real-world scenarios, and professional-grade implementations.

## Sample Plugins Overview

| Plugin | Focus | Key Features | Difficulty |
|--------|-------|--------------|------------|
| **Cat Keys** | Network requests, auto-updating | API calls, intervals, image handling | Beginner |
| **Hello World** | Internationalization | Multi-language support, localization | Beginner |  
| **Data Sources** | Dynamic UI population | Property Inspector data sources | Intermediate |
| **Layouts** | Stream Deck Plus layouts | Custom layouts, feedback systems | Advanced |
| **Lights Out** | Multi-action coordination | Game logic, device coordination | Advanced |

---

## 1. Cat Keys - Network Requests & Auto-Update

**Demonstrates**: HTTP requests, automatic updates, polling, image handling

### Complete Implementation

```typescript
import streamDeck, {
    action,
    KeyAction,
    KeyUpEvent,
    SingletonAction,
    WillAppearEvent,
    WillDisappearEvent,
} from '@elgato/streamdeck';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

/**
 * An example action class that displays a random cat image from an API.
 */
@action({ UUID: 'com.elgato.cat-keys.random-cat' })
export class RandomCat extends SingletonAction<RandomCatSettings> {
    private intervals = new Map<string, NodeJS.Timeout>();

    /**
     * Fetch a new random cat when the key is released.
     */
    override onKeyUp(ev: KeyUpEvent<RandomCatSettings>): Promise<void> | void {
        this.updateCatImage(ev.action);
    }

    /**
     * Sets the initial action image, stores the action for auto-updating, 
     * and establishes a timer for auto-updating.
     */
    override onWillAppear(ev: WillAppearEvent<RandomCatSettings>): void {
        // Set initial image
        this.updateCatImage(ev.action);

        // Setup auto-update if enabled
        const { autoUpdate = false } = ev.payload.settings;
        if (autoUpdate && !this.intervals.has(ev.action.id)) {
            const interval = setInterval(() => {
                this.updateCatImage(ev.action);
            }, FIFTEEN_MINUTES);
            
            this.intervals.set(ev.action.id, interval);
        }
    }

    /**
     * Clean up intervals when action disappears
     */
    override onWillDisappear(ev: WillDisappearEvent<RandomCatSettings>): void {
        const interval = this.intervals.get(ev.action.id);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(ev.action.id);
        }
    }

    /**
     * Handle settings changes (auto-update toggle)
     */
    override onDidReceiveSettings(ev: DidReceiveSettingsEvent<RandomCatSettings>): void {
        const { autoUpdate = false } = ev.payload.settings;
        const hasInterval = this.intervals.has(ev.action.id);

        if (autoUpdate && !hasInterval) {
            // Start auto-update
            const interval = setInterval(() => {
                this.updateCatImage(ev.action);
            }, FIFTEEN_MINUTES);
            this.intervals.set(ev.action.id, interval);
            
        } else if (!autoUpdate && hasInterval) {
            // Stop auto-update
            const interval = this.intervals.get(ev.action.id);
            if (interval) {
                clearInterval(interval);
                this.intervals.delete(ev.action.id);
            }
        }
    }

    /**
     * Fetches a random cat image from the API and updates the action
     */
    private async updateCatImage(action: KeyAction<RandomCatSettings>): Promise<void> {
        try {
            // Fetch random cat image
            const response = await fetch('https://api.thecatapi.com/v1/images/search');
            const data = await response.json();
            
            if (data && data[0] && data[0].url) {
                // Convert image to base64 data URI for Stream Deck
                const imageResponse = await fetch(data[0].url);
                const arrayBuffer = await imageResponse.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
                const dataUri = `data:${mimeType};base64,${base64}`;
                
                // Set the image on the action
                await action.setImage(dataUri);
                
                // Log success
                streamDeck.logger.info(`Updated cat image: ${data[0].url}`);
            }
        } catch (error) {
            streamDeck.logger.error(`Failed to fetch cat image: ${error}`);
            
            // Set error state
            await action.setImage('imgs/actions/random-cat/error.png');
            await action.showAlert();
        }
    }
}

/**
 * Settings for {@link RandomCat}.
 */
type RandomCatSettings = {
    autoUpdate: boolean;
};
```

### Property Inspector (UI)

```html
<!DOCTYPE html>
<html>
    <head lang="en">
        <title>Random Cat Settings</title>
        <meta charset="utf-8" />
        <script src="https://sdpi-components.dev/releases/v3/sdpi-components.js"></script>
    </head>

    <body>
        <sdpi-item title="Automatically update the cat every 15 minutes." label="Auto Update">
            <sdpi-checkbox setting="autoUpdate"></sdpi-checkbox>
        </sdpi-item>
    </body>
</html>
```

### Key Patterns Demonstrated

1. **HTTP Requests**: Fetching data from external APIs
2. **Image Handling**: Converting images to base64 data URIs
3. **Auto-Update Logic**: Using intervals with proper cleanup
4. **Error Handling**: Graceful failure with user feedback
5. **Settings Management**: Dynamic behavior based on user preferences

---

## 2. Hello World - Internationalization

**Demonstrates**: Multi-language support, i18n implementation, locale management

### Complete Implementation

```typescript
import streamdeck, {
    Action,
    action,
    DidReceiveSettingsEvent,
    KeyAction,
    KeyDownEvent,
    Language,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";

/**
 * An example action class that displays a randomized string from various supported locales
 */
@action({ UUID: "com.elgato.hello-world.newstring" })
export class NewString extends SingletonAction<NewStringSettings> {
    
    /**
     * Called whenever a NewString action is created by the Stream Deck software
     */
    override async onWillAppear(ev: WillAppearEvent<NewStringSettings>): Promise<void> {
        if (!ev.action.isKey()) return;

        let settings = ev.payload.settings;
        
        // If we don't have a title key already, set it to "clickme"
        if (!ev.payload.settings.titleKey) {
            settings = { ...ev.payload.settings, titleKey: "clickme" };
            ev.action.setSettings(settings);
        }
        
        this.displayTitleFromSettings(settings, ev.action);
    }

    /**
     * Called when the Property Inspector changes the selected language
     */
    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<NewStringSettings>): Promise<void> {
        if (!ev.action.isKey()) return;
        this.displayTitleFromSettings(ev.payload.settings, ev.action);
    }

    /**
     * Called when the user presses a key with this action on their Stream Deck
     */
    override async onKeyDown(ev: KeyDownEvent<NewStringSettings>): Promise<void> {
        // Pick a random string
        const titleKey = this.pickRandomKey();

        // Save it to our settings
        const settings = { ...ev.payload.settings, titleKey };
        ev.action.setSettings(settings);

        this.displayTitleFromSettings(settings, ev.action);
    }

    /**
     * Fetches the settings from the provided settings object and then displays it as a title on the action
     */
    async displayTitleFromSettings(settings: NewStringSettings, action: KeyAction<NewStringSettings>) {
        // Fetch the string that we have saved in the settings
        const titleKey = settings.titleKey;
        if (!titleKey) {
            return;
        }

        // Localize it
        const title = streamdeck.i18n.translate(titleKey, settings.language);
        const language = streamdeck.i18n.translate("thisLanguage", settings.language);

        // Display it
        await action.setTitle(`${language}\n\n${title}`);
    }

    /**
     * Picks a random key value to use for translation lookups
     */
    pickRandomKey() {
        const options = [
            "flash",
            "selectprop", 
            "on",
            "off",
            "toggle",
            "action",
            "dynamic",
            "clickme",
        ];
        const index = Math.floor(Math.random() * options.length);
        return options[index];
    }
}

type NewStringSettings = {
    language: Language | undefined;
    titleKey: string | undefined;
};
```

### Localization Files

**en.json:**
```json
{
  "Localization": {
    "flash": "Flash",
    "selectprop": "Select Prop",
    "on": "On",
    "off": "Off", 
    "toggle": "Toggle",
    "action": "Action",
    "dynamic": "Dynamic",
    "clickme": "Click Me!",
    "thisLanguage": "English"
  }
}
```

**de.json:**
```json
{
  "Localization": {
    "flash": "Blitz",
    "selectprop": "Eigenschaft wählen", 
    "on": "An",
    "off": "Aus",
    "toggle": "Umschalten",
    "action": "Aktion", 
    "dynamic": "Dynamisch",
    "clickme": "Klick mich!",
    "thisLanguage": "Deutsch"
  }
}
```

### Property Inspector with Locale Support

```html
<!doctype html>
<html>
    <head lang="en">
        <meta charset="utf-8" />
        <script src="https://sdpi-components.dev/releases/v3/sdpi-components.js"></script>
        <script src="./locale.js"></script>
    </head>

    <body>
        <sdpi-item label="Language">
            <sdpi-select setting="language" placeholder="__MSG_PickLanguage__">
                <option>__MSG_Default__</option>
                <option value="zh_CN">__MSG_Chinese__</option>
                <option value="en">__MSG_English__</option>
                <option value="fr">__MSG_French__</option>
                <option value="de">__MSG_German__</option>
                <option value="ja">__MSG_Japanese__</option>
                <option value="ko">__MSG_Korean__</option>
                <option value="es">__MSG_Spanish__</option>
            </sdpi-select>
        </sdpi-item>
    </body>
</html>
```

---

## 3. Data Sources - Dynamic Property Inspector

**Demonstrates**: Dynamic UI population, Property Inspector communication, data sources

### Complete Implementation

```typescript
import streamDeck, { 
    action, 
    SingletonAction, 
    type JsonValue, 
    type KeyDownEvent, 
    type SendToPluginEvent 
} from "@elgato/streamdeck";

/**
 * An action that demonstrates populating a drop-down with a dynamic data source.
 * After selecting a product, pressing the button opens the product's page.
 */
@action({ UUID: "com.elgato.product-viewer.open-product-page" })
export class OpenProductPage extends SingletonAction<Settings> {
    
    /**
     * Opens the selected product's page in the user's default browser.
     */
    override onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> | void {
        if (ev.payload.settings.product) {
            streamDeck.system.openUrl(ev.payload.settings.product);
        }
    }

    /**
     * Listen for messages from the property inspector.
     */
    override onSendToPlugin(ev: SendToPluginEvent<JsonValue, Settings>): Promise<void> | void {
        // Check if the payload is requesting a data source
        if (ev.payload instanceof Object && "event" in ev.payload && ev.payload.event === "getProducts") {
            // Send the product data to the property inspector
            streamDeck.ui.current?.sendToPropertyInspector({
                event: "getProducts",
                items: this.#getStreamDeckProducts(),
            } satisfies DataSourcePayload);
        }
    }

    /**
     * Gets a collection of items to be shown within the drop down.
     * In real applications, this could fetch from an external API.
     */
    #getStreamDeckProducts(): DataSourceResult {
        return [
            {
                value: "https://www.elgato.com/stream-deck",
                label: "Stream Deck",
            },
            {
                value: "https://www.elgato.com/stream-deck-mk2", 
                label: "Stream Deck MK.2",
            },
            {
                value: "https://www.elgato.com/stream-deck-plus",
                label: "Stream Deck +",
            },
            {
                value: "https://www.elgato.com/stream-deck-xl",
                label: "Stream Deck XL",
            },
            {
                value: "https://www.elgato.com/stream-deck-mini",
                label: "Stream Deck Mini",
            },
        ];
    }
}

type Settings = {
    product?: string;
};

type DataSourcePayload = {
    event: string;
    items: DataSourceResult;
};

type DataSourceResult = Array<{
    value: string;
    label: string;
}>;
```

### Property Inspector with Data Source

Uses [SDPI Components](https://sdpi-components.dev/) for dynamic content loading:

```html
<!DOCTYPE html>
<html>
<head lang="en">
    <title>Open Product Page</title>
    <meta charset="utf-8" />
    <script src="sdpi-components.js"></script>
</head>

<body>
    <sdpi-item label="Product">
        <sdpi-select 
            setting="product" 
            datasource="getProducts" 
            loading="Fetching products..."
            placeholder="Please select">
        </sdpi-select>
    </sdpi-item>
</body>
</html>
```

> 📖 See [SDPI Components documentation](https://sdpi-components.dev/docs/components) for more advanced features like data sources

### Key Patterns Demonstrated

1. **Data Sources**: Populating UI components dynamically
2. **Plugin-UI Communication**: Two-way messaging with Property Inspector
3. **External Integration**: Opening URLs in default browser
4. **Type Safety**: Well-defined TypeScript interfaces

---

## 4. Stream Deck Plus Layouts

**Demonstrates**: Advanced layouts, custom feedback, touchscreen interactions

### Built-in Layout Example

```typescript
import { action, DialRotateEvent, SingletonAction } from '@elgato/streamdeck';

/**
 * Demonstrates switching between built-in layouts on Stream Deck Plus
 */
@action({ UUID: 'com.elgato.layouts.built-in-layout' })
export class BuiltInLayout extends SingletonAction {
    
    /**
     * Switch the layout and update the title based on the dial rotation.
     */
    override onDialRotate(ev: DialRotateEvent<DialSettings>): Promise<void> | void {
        let { value = 0 } = ev.payload.settings;
        const { ticks } = ev.payload;
        const adjustment = ticks > 0 ? 1 : -1;

        value = Math.max(0, Math.min(5, value + adjustment));

        switch (value) {
            case 0:
                ev.action.setFeedbackLayout('$X1');
                ev.action.setFeedback({ title: 'Layout $X1' });
                break;
                
            case 1:
                ev.action.setFeedbackLayout('$A0');
                ev.action.setFeedback({
                    title: 'Layout $A0',
                    'full-canvas': { background: 'blue' },
                    canvas: { background: '#FFFFFF' },
                });
                break;
                
            case 2:
                ev.action.setFeedbackLayout('$A1');
                ev.action.setFeedback({ 
                    title: 'Layout $A1', 
                    value: '9000' 
                });
                break;
                
            case 3:
                ev.action.setFeedbackLayout('$B1');
                ev.action.setFeedback({
                    title: 'Layout $B1',
                    value: '50',
                    indicator: { value: '50' },
                });
                break;
                
            case 4:
                ev.action.setFeedbackLayout('$B2');
                ev.action.setFeedback({
                    title: 'Layout $B2',
                    value: '50',
                    indicator: {
                        value: '50',
                        bar_bg_c: '0:#ffffff,0.33:#000a98,0.66:#ffffff,1:#000a98',
                    },
                });
                break;
                
            case 5:
                ev.action.setFeedbackLayout('$C1');
                ev.action.setFeedback({
                    title: 'Layout $C1',
                    icon1: { value: 'imgs/actions/layout/layout.svg' },
                    icon2: { value: 'imgs/actions/layout/layout.svg' },
                    indicator1: { value: 25 },
                    indicator2: { value: 75 },
                });
                break;
        }

        ev.action.setSettings({ value });
    }
}

type DialSettings = {
    value: number;
};
```

### Custom Layout Example

```typescript
import { action, DialRotateEvent, SingletonAction } from '@elgato/streamdeck';

/**
 * Demonstrates custom layouts with JSON files
 */
@action({ UUID: 'com.elgato.layouts.custom-layout' })
export class CustomLayout extends SingletonAction {
    
    override async onDialRotate(ev: DialRotateEvent<DialSettings>): Promise<void> {
        let { value = 0 } = ev.payload.settings;
        const { ticks } = ev.payload;
        const adjustment = ticks > 0 ? 1 : -1;

        value = Math.max(0, Math.min(3, value + adjustment));

        switch (value) {
            case 0:
                await ev.action.setFeedbackLayout('layouts/custom-layout-1.json');
                await ev.action.setFeedback({ title: 'Custom Layout 1' });
                break;
                
            case 1:
                await ev.action.setFeedbackLayout('layouts/custom-layout-2.json');
                await ev.action.setFeedback({ 
                    'my-image': 'imgs/actions/custom-layout/doggo.png' 
                });
                break;
                
            case 2:
                await ev.action.setFeedbackLayout('layouts/custom-layout-3.json');
                await ev.action.setFeedback({
                    battery: { value: 50 },
                    icon2: { value: 'imgs/actions/custom-layout/battery.svg' },
                    icon: { value: 'imgs/actions/custom-layout/controller.svg' },
                    percent: { value: '50%' },
                });
                break;
                
            case 3:
                await ev.action.setFeedbackLayout('layouts/custom-layout-4.json');
                await ev.action.setFeedback({
                    icon1: { value: 'imgs/actions/custom-layout/battery.svg' },
                    icon2: { value: 'imgs/actions/custom-layout/controller.svg' },
                    icon3: { value: 'imgs/actions/custom-layout/custom-layout.svg' },
                });
                break;
        }

        await ev.action.setSettings({ value });
    }
}
```

### Custom Layout JSON

```json
// layouts/custom-layout-3.json
{
    "id": "battery-status",
    "items": [
        {
            "key": "icon",
            "type": "pixmap",
            "rect": [10, 10, 30, 30]
        },
        {
            "key": "battery",
            "type": "bar",
            "rect": [45, 15, 130, 25],
            "bar_bg_c": "#333333",
            "bar_fill_c": "#00FF00"
        },
        {
            "key": "percent",
            "type": "text",
            "rect": [10, 35, 134, 50],
            "alignment": "center",
            "font": {
                "family": "Arial",
                "size": 12
            }
        }
    ]
}
```

---

## 5. Lights Out Game - Multi-Action Coordination

**Demonstrates**: Complex game logic, device coordination, state management

### Game Piece Action

```typescript
import streamDeck, {
    action,
    Coordinates,
    KeyAction,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";

const LIGHT_ON = 1;
const LIGHT_OFF = 0;

/**
 * A play piece for the lights-out game
 */
@action({ UUID: "com.elgato.lightsout.gamepiece" })
export class GamePiece extends SingletonAction<GamePieceSettings> {
    private states: Map<string, number> = new Map();

    constructor() {
        super();
    }

    override onWillAppear(ev: WillAppearEvent<GamePieceSettings>): Promise<void> | void {
        // Find and store the existing state of any visible action
        if (ev.action.isKey() && ev.payload.state !== undefined) {
            this.states.set(ev.action.id, ev.payload.state);
        }
    }

    /**
     * A generator which narrows down all visible actions to only ones 
     * that are present on a specific Stream Deck device
     */
    *deviceItems(deviceId: string): IterableIterator<KeyAction<GamePieceSettings>> {
        for (const action of this.actions) {
            if (action.device.id === deviceId && action.isKey() && action.coordinates !== undefined) {
                yield action;
            }
        }
    }

    /**
     * A generator which can find the (up to) 5 actions which would be affected 
     * by a light switch toggle event
     */
    *adjacentItems(deviceId: string, coordinates: Coordinates): IterableIterator<KeyAction<GamePieceSettings>> {
        // A list of x/y offsets to use as offsets to find candidate actions
        const offsets = [
            [-1, 0], // Left
            [0, 0],  // Center (pressed)
            [1, 0],  // Right
            [0, -1], // Up
            [0, 1],  // Down
        ];
        
        for (const action of this.deviceItems(deviceId)) {
            const candidate = action.coordinates;
            const pressed = coordinates;
            if (!candidate) continue;
            
            for (const offset of offsets) {
                const checkColumn = pressed.column + offset[0];
                const checkRow = pressed.row + offset[1];
                
                if (candidate.column === checkColumn && candidate.row === checkRow) {
                    yield action;
                    break;
                }
            }
        }
    }

    /**
     * Toggles the internal state for the specified action ID and returns the new state
     */
    toggleState(actionId: string) {
        let state = this.states.get(actionId);
        state = state ? 0 : 1;
        this.states.set(actionId, state);
        return state;
    }

    /**
     * Performs a light switch toggle, which toggles the state of the 4 actions 
     * that border the pressed action plus the action itself
     */
    override async onKeyDown(ev: KeyDownEvent<GamePieceSettings>): Promise<void> {
        if (!ev.action.isKey() || !ev.action.coordinates) return;

        // Toggle all adjacent lights (including the pressed one)
        for (const action of this.adjacentItems(ev.action.device.id, ev.action.coordinates)) {
            const newState = this.toggleState(action.id);
            await action.setState(newState);
        }

        // Check if the player won
        await this.tryWin(ev.action.device.id);
    }

    /**
     * Sets all tracked actions to the specified state.
     */
    setAll(deviceId: string, state: LightState) {
        for (const action of this.deviceItems(deviceId)) {
            this.states.set(action.id, state);
            action.setState(state);
        }
    }

    /**
     * Flashes all actions on and off a certain number of times
     */
    async flashAll(deviceId: string, count: number): Promise<void> {
        const offset = 100;
        while (count-- > 0) {
            await setTimeout(offset);
            this.setAll(deviceId, LIGHT_OFF);

            await setTimeout(offset);
            this.setAll(deviceId, LIGHT_ON);
        }
        await setTimeout(offset * 2);
    }

    /**
     * Checks the game state to see if the player has won
     */
    async tryWin(deviceId: string) {
        // Check if all lights are off (winning condition)
        let allOff = true;
        for (const action of this.deviceItems(deviceId)) {
            const state = this.states.get(action.id);
            if (state === LIGHT_ON) {
                allOff = false;
                break;
            }
        }

        if (allOff) {
            await this.displayWin(deviceId);
        }
    }

    /**
     * Plays the win sequence.
     */
    async displayWin(deviceId: string) {
        // Flash 3 times to indicate victory
        await this.flashAll(deviceId, 3);
        
        // Reset for next game
        await this.randomize(deviceId);
    }

    /**
     * Randomize the board through simulated play.
     */
    async randomize(deviceId: string) {
        // Start with all lights on
        this.setAll(deviceId, LIGHT_ON);
        
        // Simulate random button presses to create a solvable puzzle
        const keys = Array.from(this.deviceItems(deviceId));
        const randomPresses = Math.floor(Math.random() * 10) + 5;
        
        for (let i = 0; i < randomPresses; i++) {
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            if (randomKey.coordinates) {
                // Simulate the toggle logic without triggering win condition
                for (const action of this.adjacentItems(deviceId, randomKey.coordinates)) {
                    this.toggleState(action.id);
                }
            }
        }

        // Update all of the action states
        for (const action of keys) {
            const state = this.states.get(action.id);
            action.setState(state ? 1 : 0);
            
            // Wait for each light to "turn off" as if someone is walking through
            if (state == LIGHT_OFF) {
                await setTimeout(100);
            }
        }
    }
}

type GamePieceSettings = Record<string, never>;
type LightState = typeof LIGHT_ON | typeof LIGHT_OFF;
```

### Reset Action

```typescript
import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { GamePiece } from "./gamePiece";

/**
 * Reset action that randomizes the game board
 */
@action({ UUID: "com.elgato.lightsout.reset" })
export class Reset extends SingletonAction {
    constructor(private gamePiece: GamePiece) {
        super();
    }

    override async onKeyDown(ev: KeyDownEvent): Promise<void> {
        // Randomize the game board
        await this.gamePiece.randomize(ev.action.device.id);
        
        // Show feedback
        await ev.action.showOk();
    }
}
```

---

## Common Patterns Across Examples

### 1. Plugin Registration Pattern

```typescript
import streamDeck, { LogLevel } from '@elgato/streamdeck';
import { MyAction } from './actions/my-action';

// Enable trace logging for development
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register actions
streamDeck.actions.registerAction(new MyAction());

// Connect to Stream Deck
streamDeck.connect();
```

### 2. Error Handling Pattern

```typescript
override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    try {
        await this.performAction(ev);
        await ev.action.showOk();
    } catch (error) {
        streamDeck.logger.error(`Action failed: ${error.message}`);
        await ev.action.showAlert();
    }
}
```

### 3. Settings Management Pattern

```typescript
override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
    const settings = ev.payload.settings;
    
    // Validate settings
    if (!this.validateSettings(settings)) {
        streamDeck.logger.warn('Invalid settings received');
        return;
    }
    
    // Apply settings changes
    await this.applySettings(settings, ev.action);
}
```

### 4. Cleanup Pattern

```typescript
private intervals = new Map<string, NodeJS.Timeout>();

override onWillDisappear(ev: WillDisappearEvent): void {
    // Clean up any resources
    const interval = this.intervals.get(ev.action.id);
    if (interval) {
        clearInterval(interval);
        this.intervals.delete(ev.action.id);
    }
}
```

## Build Configuration

All samples use a consistent Rollup configuration:

```javascript
// rollup.config.mjs
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import path from "node:path";
import url from "node:url";

const isWatching = !!process.env.ROLLUP_WATCH;
const sdPlugin = "com.company.plugin.sdPlugin";

export default {
    input: "src/plugin.ts",
    output: {
        file: `${sdPlugin}/bin/plugin.js`,
        sourcemap: isWatching,
        sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
            return url.pathToFileURL(path.resolve(path.dirname(sourcemapPath), relativeSourcePath)).href;
        }
    },
    plugins: [
        {
            name: "watch-externals",
            buildStart: function () {
                this.addWatchFile(`${sdPlugin}/manifest.json`);
            },
        },
        typescript({
            mapRoot: isWatching ? "./" : undefined
        }),
        nodeResolve({
            browser: false,
            exportConditions: ["node"]
        }),
        commonjs(),
        !isWatching && terser()
    ].filter(Boolean)
};
```

## Installation and Testing

### Prerequisites
```bash
npm install -g @elgato/cli
```

### Development Workflow
```bash
# Install dependencies
npm install

# Link plugin for development
streamdeck link *.sdPlugin

# Build and watch for changes  
npm run watch
```

### Building for Distribution
```bash
npm run build
streamdeck validate *.sdPlugin
streamdeck pack *.sdPlugin
```

---

These real-world examples demonstrate production-quality patterns and advanced techniques that go beyond basic plugin development. They show how to handle complex scenarios like network requests, internationalization, dynamic UI population, advanced layouts, and multi-action coordination while maintaining clean, maintainable code.