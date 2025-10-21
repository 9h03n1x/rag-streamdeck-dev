# 🚀 Quick Reference - Stream Deck Plugin Development

## Essential Commands

```bash
# Build plugin
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Enable developer mode (for debugging)
streamdeck dev

# Restart plugin
streamdeck restart com.nicco-hagedorn.eve-control-deck

# View logs in real-time
streamdeck logs com.nicco-hagedorn.eve-control-deck

# Link plugin to Stream Deck
streamdeck link com.nicco-hagedorn.eve-control-deck.sdPlugin
```

## Remote Debugger

1. **Enable:** `streamdeck dev`
2. **Access:** http://localhost:23654/
3. **Requirement:** Property inspector must be visible in Stream Deck

## Property Inspector Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <script src="sdpi-components.js"></script>
</head>
<body>
    <sdpi-item label="Text Field">
        <sdpi-textfield setting="fieldName" placeholder="Enter value"></sdpi-textfield>
    </sdpi-item>
    
    <sdpi-item label="Checkbox">
        <sdpi-checkbox setting="checkboxName" checked></sdpi-checkbox>
    </sdpi-item>
    
    <sdpi-item label="Dropdown">
        <sdpi-select setting="selectName">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
        </sdpi-select>
    </sdpi-item>

    <script>
        const { streamDeckClient } = SDPIComponents;
        streamDeckClient.on('didReceiveSettings', ({ settings }) => {
            console.log('Settings:', settings);
        });
    </script>
</body>
</html>
```

## Action Class Template

```typescript
import {
    action,
    JsonObject,
    SingletonAction,
    WillAppearEvent,
    DidReceiveSettingsEvent,
    KeyDownEvent
} from "@elgato/streamdeck";
import { streamDeck } from "@elgato/streamdeck";
import { actionRegistry } from "../utils/action-registry";

interface MySettings extends JsonObject {
    customSetting?: string;
    enableFeature?: boolean;
}

@action({ UUID: "com.nicco-hagedorn.eve-control-deck.my-action" })
export class MyAction extends SingletonAction<MySettings> {
    
    override async onWillAppear(ev: WillAppearEvent<MySettings>): Promise<void> {
        const settings = ev.payload.settings;
        
        // Register with action registry
        actionRegistry.register(
            ev.action,
            ev.action.id,
            characterId || 0,  // 0 for universal actions
            "my-action"
        );
        
        // Set initial title
        await ev.action.setTitle("My Action");
        
        streamDeck.logger.info('[MyAction] Appeared:', JSON.stringify(settings));
    }
    
    override async onWillDisappear(ev: WillDisappearEvent<MySettings>): Promise<void> {
        actionRegistry.unregister(ev.action.id);
    }
    
    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<MySettings>): Promise<void> {
        const settings = ev.payload.settings;
        streamDeck.logger.info('[MyAction] Settings:', JSON.stringify(settings));
        
        // Update display based on settings
        if (settings.customSetting) {
            await ev.action.setTitle(settings.customSetting);
        }
    }
    
    override async onKeyDown(ev: KeyDownEvent<MySettings>): Promise<void> {
        const settings = ev.payload.settings;
        
        // Button pressed logic
        await ev.action.setTitle("Pressed!");
    }
}
```

## sdpi-components Cheat Sheet

| Component | HTML | Settings Output |
|-----------|------|-----------------|
| Text Field | `<sdpi-textfield setting="name">` | `{ "name": "text" }` |
| Checkbox | `<sdpi-checkbox setting="enabled" checked>` | `{ "enabled": true }` |
| Select | `<sdpi-select setting="choice">` | `{ "choice": "value" }` |
| Textarea | `<sdpi-textarea setting="description">` | `{ "description": "text" }` |
| Color | `<sdpi-color setting="color">` | `{ "color": "#ff0000" }` |
| Range | `<sdpi-range setting="volume" min="0" max="100">` | `{ "volume": 50 }` |
| File | `<sdpi-file setting="path">` | `{ "path": "file path" }` |

## Console Debug Commands

```javascript
// Check if library loaded
SDPIComponents

// Get Stream Deck client
SDPIComponents.streamDeckClient

// Get current settings
await SDPIComponents.streamDeckClient.getSettings()

// Set settings manually
await SDPIComponents.streamDeckClient.setSettings({ key: "value" })

// Listen for changes
SDPIComponents.streamDeckClient.on('didReceiveSettings', (e) => {
    console.log(e.settings);
});
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Settings not persisting | Add `setting="propertyName"` to component |
| `SDPIComponents is not defined` | Check `sdpi-components.js` loaded in `<head>` |
| 404 on sdpi-components.js | Download: `curl -o ui/sdpi-components.js https://sdpi-components.dev/releases/v4/sdpi-components.js` |
| Blank property inspector | Check browser console for JavaScript errors |
| Plugin not receiving settings | Implement `onDidReceiveSettings` handler |
| Remote debugger not working | Enable developer mode: `streamdeck dev` |

## Logging

```typescript
// Info logging
streamDeck.logger.info('[MyAction] Info message');

// Warning
streamDeck.logger.warn('[MyAction] Warning message');

// Error
streamDeck.logger.error('[MyAction] Error message', error);

// Debug (only in debug mode)
streamDeck.logger.debug('[MyAction] Debug message');
```

## File Structure

```
eve-control-deck/
├── src/
│   ├── actions/          # Action TypeScript files
│   ├── services/         # API clients and services
│   ├── utils/            # Utilities (registry, cache, formatters)
│   └── types/            # TypeScript interfaces
├── com.nicco-hagedorn.eve-control-deck.sdPlugin/
│   ├── manifest.json     # Plugin metadata & actions
│   ├── ui/               # Property inspector HTMLs
│   │   └── sdpi-components.js  # Stream Deck UI library
│   ├── imgs/             # Icons and images
│   ├── bin/              # Compiled plugin.js
│   └── logs/             # Plugin logs
├── package.json
├── rollup.config.mjs     # Build configuration
└── tsconfig.json         # TypeScript configuration
```

## Manifest.json Structure

```json
{
    "Name": "Action Name",
    "UUID": "com.nicco-hagedorn.eve-control-deck.action-name",
    "Icon": "imgs/actions/action-name/icon",
    "PropertyInspectorPath": "ui/action-name.html",
    "Tooltip": "Action description",
    "States": [
        {
            "Image": "imgs/actions/action-name/key"
        }
    ]
}
```

## Development Workflow

```
Edit Code → Build → Restart → Test → Debug (if needed)
    ↓         ↓        ↓        ↓           ↓
  VS Code   npm run  streamdeck  Stream   http://
            build    restart     Deck     :23654/
```

## Testing Checklist

- [ ] Plugin builds without errors
- [ ] Action appears in Stream Deck
- [ ] Property inspector opens
- [ ] Settings persist after closing/reopening
- [ ] Button press triggers action
- [ ] Title/image updates correctly
- [ ] Works across multiple devices
- [ ] No errors in plugin logs
- [ ] No console errors in remote debugger

## Resources

- **Official Docs:** https://docs.elgato.com/sdk/
- **sdpi-components:** https://sdpi-components.dev/
- **Remote Debugger:** http://localhost:23654/
- **Example Plugin:** https://github.com/elgatosf/streamdeck-counter-template

---

**Pro Tip:** Use `npm run watch` during development to automatically rebuild and restart the plugin on file changes!
