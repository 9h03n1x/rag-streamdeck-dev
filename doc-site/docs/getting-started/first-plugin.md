# Basic Counter Plugin Example

Complete implementation of a simple counter plugin.

## File Structure

```
counter-plugin/
├── com.example.counter.sdPlugin/
│   ├── bin/
│   │   └── plugin.js
│   ├── imgs/
│   │   ├── actions/
│   │   │   └── counter/
│   │   │       ├── icon.png
│   │   │       └── key.png
│   │   └── plugin/
│   │       ├── category-icon.png
│   │       └── marketplace.png
│   ├── ui/
│   │   └── counter.html
│   └── manifest.json
├── src/
│   ├── actions/
│   │   └── counter.ts
│   └── plugin.ts
├── package.json
└── rollup.config.mjs
```

## manifest.json

```json
{
  "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
  "UUID": "com.example.counter",
  "Name": "Counter",
  "Version": "1.0.0.0",
  "Author": "Example Corp",
  "Description": "Simple counter plugin",
  "Category": "Examples",
  "CategoryIcon": "imgs/plugin/category-icon",
  "Icon": "imgs/plugin/marketplace",
  "CodePath": "bin/plugin.js",
  "SDKVersion": 2,
  "Software": {
    "MinimumVersion": "6.6"
  },
  "OS": [
    {
      "Platform": "mac",
      "MinimumVersion": "10.15"
    },
    {
      "Platform": "windows",
      "MinimumVersion": "10"
    }
  ],
  "Nodejs": {
    "Version": "20",
    "Debug": "enabled"
  },
  "Actions": [
    {
      "Name": "Counter",
      "UUID": "com.example.counter.increment",
      "Icon": "imgs/actions/counter/icon",
      "Tooltip": "Increment counter",
      "Controllers": ["Keypad"],
      "PropertyInspectorPath": "ui/counter.html",
      "States": [
        {
          "Image": "imgs/actions/counter/key",
          "TitleAlignment": "middle"
        }
      ]
    }
  ]
}
```

## src/actions/counter.ts

```typescript
import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
    DidReceiveSettingsEvent
} from "@elgato/streamdeck";

type CounterSettings = {
    count: number;
    label: string;
};

@action({ UUID: "com.example.counter.increment" })
export class CounterAction extends SingletonAction<CounterSettings> {
    /**
     * Called when action appears on Stream Deck
     */
    override async onWillAppear(ev: WillAppearEvent<CounterSettings>): Promise<void> {
        const { count = 0, label = "Count" } = ev.payload.settings;
        await ev.action.setTitle(`${label}\n${count}`);
    }
    
    /**
     * Called when key is pressed
     */
    override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
        let { count = 0, label = "Count" } = ev.payload.settings;
        
        // Increment counter
        count++;
        
        // Save new count
        await ev.action.setSettings({ count, label });
        
        // Update display
        await ev.action.setTitle(`${label}\n${count}`);
        
        // Show success indicator
        await ev.action.showOk();
        
        // Log
        streamDeck.logger.info(`Counter incremented to ${count}`);
    }
    
    /**
     * Called when settings change from property inspector
     */
    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<CounterSettings>): Promise<void> {
        const { count = 0, label = "Count" } = ev.payload.settings;
        await ev.action.setTitle(`${label}\n${count}`);
    }
}
```

## src/plugin.ts

```typescript
import streamDeck from "@elgato/streamdeck";
import { CounterAction } from "./actions/counter";

// Register actions
streamDeck.actions.registerAction(new CounterAction());

// Connect to Stream Deck
streamDeck.connect();
```

## ui/counter.html

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Counter Settings</title>
    <script src="../sdpi-components.js"></script>
</head>
<body>
    <sdpi-item label="Label">
        <sdpi-textfield 
            setting="label" 
            placeholder="Enter label"
            maxlength="20"
        ></sdpi-textfield>
    </sdpi-item>
    
    <sdpi-item label="Current Count">
        <sdpi-textfield 
            setting="count" 
            type="number"
            min="0"
        ></sdpi-textfield>
    </sdpi-item>
    
    <sdpi-item label="">
        <sdpi-button onclick="resetCounter()">
            Reset Counter
        </sdpi-button>
    </sdpi-item>
    
    <script>
        const { streamDeckClient } = SDPIComponents;
        
        async function resetCounter() {
            await streamDeckClient.setSettings({
                count: 0,
                label: "Count"
            });
        }
    </script>
</body>
</html>
```

## package.json

```json
{
  "name": "counter-plugin",
  "version": "1.0.0",
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c -w",
    "dev": "rollup -c -w --watch.onEnd=\"streamdeck restart com.example.counter\"",
    "link": "streamdeck link com.example.counter.sdPlugin",
    "validate": "streamdeck validate com.example.counter.sdPlugin",
    "pack": "streamdeck pack com.example.counter.sdPlugin"
  },
  "dependencies": {
    "@elgato/streamdeck": "latest"
  },
  "devDependencies": {
    "@rollup/plugin-node-resolve": "latest",
    "@rollup/plugin-typescript": "latest",
    "rollup": "latest",
    "typescript": "latest"
  }
}
```

## Usage

1. Install dependencies:
```bash
npm install
```

2. Build plugin:
```bash
npm run build
```

3. Link for development:
```bash
npm run link
```

4. Start watch mode:
```bash
npm run dev
```

5. Test in Stream Deck:
   - Add Counter action to Stream Deck
   - Press to increment
   - Open property inspector to configure

## Extensions

### Reset on Long Press

```typescript
private longPressTimer?: NodeJS.Timeout;

override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
    this.longPressTimer = setTimeout(async () => {
        await ev.action.setSettings({ count: 0 });
        await ev.action.setTitle("Reset");
    }, 2000);
}

override async onKeyUp(ev: KeyUpEvent<CounterSettings>): Promise<void> {
    if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        // Normal increment
    }
}
```

### Maximum Count

```typescript
const MAX_COUNT = 999;

override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
    let { count = 0 } = ev.payload.settings;
    
    if (count >= MAX_COUNT) {
        await ev.action.showAlert();
        return;
    }
    
    count++;
    await ev.action.setSettings({ count });
    await ev.action.setTitle(`${count}`);
}
```
