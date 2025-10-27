---
category: core-concepts
title: Stream Deck Plus Deep Dive
tags: [stream-deck-plus, dial, encoder, touchscreen, rotary, feedback, layout]
difficulty: advanced
sdk-version: v2
related-files: [action-development.md, manifest-templates.md, common-patterns.md]
description: Complete guide to Stream Deck Plus specific features including dial/encoder actions, touchscreen interactions, layouts, and advanced feedback systems
---

# Stream Deck Plus Deep Dive

## Overview

The Stream Deck Plus introduces revolutionary hardware features that extend beyond traditional button-based interactions. This guide covers the unique capabilities of encoder (dial + touchscreen) actions, advanced feedback systems, and specialized interaction patterns.

## Hardware Architecture

### Stream Deck Plus Components

```typescript
// Device types for Stream Deck Plus
enum DeviceType {
    StreamDeck = 0,
    StreamDeckMini = 1,
    StreamDeckXL = 2,
    StreamDeckMobile = 3,
    StreamDeckPedal = 4,
    StreamDeckPlus = 7  // ← Stream Deck Plus
}

// Controller types on Stream Deck Plus
type Controller = "Keypad" | "Encoder";
```

### Physical Layout

```
Stream Deck Plus Layout:
┌─────────────────────────────┐
│  [Key] [Key] [Key] [Key]    │  ← Row 0 (Keypad Controllers)
│  [Key] [Key] [Key] [Key]    │
│                             │
│  [◯═══][◯═══][◯═══][◯═══]  │  ← Row 0 (Encoder Controllers)
│   D1    D2    D3    D4     │    Dials with touchscreens
└─────────────────────────────┘

Coordinates System:
- Keys: { row: 0-1, column: 0-3 } (controller: "Keypad")
- Dials: { row: 0, column: 0-3 } (controller: "Encoder")
```

## Encoder (Dial) Actions

### Action Class Structure

```typescript
import { action, DialAction, DialRotateEvent, DialDownEvent, TouchTapEvent } from "@elgato/streamdeck";

@action({ UUID: "com.company.plugin.volume" })
export class VolumeDialAction extends SingletonAction<VolumeSettings> {
    
    // Dial rotation (primary interaction)
    override async onDialRotate(ev: DialRotateEvent<VolumeSettings>): Promise<void> {
        const { volume = 50, step = 5 } = ev.payload.settings;
        const { ticks, pressed } = ev.payload;
        
        // Calculate new volume
        let newVolume = volume + (ticks * step);
        newVolume = Math.max(0, Math.min(100, newVolume));
        
        // Save settings
        await ev.action.setSettings({ ...ev.payload.settings, volume: newVolume });
        
        // Update visual feedback
        await this.updateFeedback(ev.action, newVolume, pressed);
        
        // Perform system action
        await this.setSystemVolume(newVolume);
    }
    
    // Dial press/release
    override async onDialDown(ev: DialDownEvent<VolumeSettings>): Promise<void> {
        // Mute/unmute on dial press
        const { muted = false } = ev.payload.settings;
        await ev.action.setSettings({ ...ev.payload.settings, muted: !muted });
        await this.updateFeedback(ev.action, ev.payload.settings.volume, false, !muted);
    }
    
    override async onDialUp(ev: DialUpEvent<VolumeSettings>): Promise<void> {
        // Visual feedback on release
        await this.updateFeedback(ev.action, ev.payload.settings.volume, false);
    }
    
    // Touchscreen interactions
    override async onTouchTap(ev: TouchTapEvent<VolumeSettings>): Promise<void> {
        const { tapPos, hold } = ev.payload;
        const [x, y] = tapPos;
        
        if (hold) {
            // Long tap - open settings
            await this.openVolumeSettings(ev.action);
        } else {
            // Quick tap - toggle mute based on tap position
            if (x < 72) { // Left side
                await this.decreaseVolume(ev.action);
            } else { // Right side  
                await this.increaseVolume(ev.action);
            }
        }
    }
}

type VolumeSettings = {
    volume: number;
    step: number;
    muted: boolean;
    deviceId?: string;
};
```

### Event Details

#### DialRotateEvent Properties

```typescript
interface DialRotateEvent<T> {
    action: DialAction<T>;
    payload: {
        controller: "Encoder";
        coordinates: { column: number; row: 0 };
        settings: T;
        ticks: number;        // Rotation amount (-n to +n)
        pressed: boolean;     // Was dial pressed during rotation?
    };
    type: "dialRotate";
}

// Example usage:
override async onDialRotate(ev: DialRotateEvent<Settings>): Promise<void> {
    const { ticks, pressed } = ev.payload;
    
    if (pressed) {
        // Fine adjustment when dial is pressed
        await this.adjustFine(ticks);
    } else {
        // Coarse adjustment when dial is free
        await this.adjustCoarse(ticks * 5);
    }
}
```

#### TouchTapEvent Properties

```typescript
interface TouchTapEvent<T> {
    action: DialAction<T>;
    payload: {
        controller: "Encoder";
        coordinates: { column: number; row: 0 };
        settings: T;
        hold: boolean;                    // Long press detection
        tapPos: [x: number, y: number];   // Tap coordinates (0-144)
    };
    type: "touchTap";
}

// Touch zones example:
override async onTouchTap(ev: TouchTapEvent<Settings>): Promise<void> {
    const [x, y] = ev.payload.tapPos;
    
    // Divide touchscreen into zones
    if (y < 48) {        // Top third
        await this.handleTopZone(x);
    } else if (y < 96) { // Middle third
        await this.handleMiddleZone(x);
    } else {             // Bottom third
        await this.handleBottomZone(x);
    }
}
```

## Layouts and Feedback System

### Built-in Layouts

Stream Deck Plus supports dynamic layouts for rich visual feedback:

```typescript
// Built-in layout identifiers
type BuiltInLayouts = 
    | "$A0"  // Empty layout
    | "$A1"  // Icon + title
    | "$B1"  // Icon + title + value
    | "$B2"  // Icon + title + bar
    | "$C1"  // Large icon + title + value
    | "$X1"; // Custom layout

// Set layout
await action.setFeedbackLayout("$B1");

// Update layout items
await action.setFeedback({
    icon: "data:image/svg+xml;base64,...",
    title: "Volume",
    value: "75%"
});
```

### Custom Layout Creation

Create advanced custom layouts:

```json
// layouts/volume-control.json
{
    "id": "volume-control-v1",
    "items": [
        {
            "key": "icon",
            "type": "pixmap",
            "rect": [8, 8, 32, 32],
            "zOrder": 100
        },
        {
            "key": "title", 
            "type": "text",
            "rect": [44, 8, 96, 24],
            "alignment": "left",
            "font": {
                "family": "Arial",
                "size": 12,
                "weight": 600
            },
            "zOrder": 100
        },
        {
            "key": "volume_bar",
            "type": "bar",
            "rect": [8, 44, 128, 60],
            "bar_bg_c": "#333333",
            "bar_fill_c": "#00D4FF",
            "bar_border_c": "#666666",
            "zOrder": 50
        },
        {
            "key": "volume_text",
            "type": "text", 
            "rect": [8, 64, 128, 84],
            "alignment": "center",
            "font": {
                "family": "Arial",
                "size": 14,
                "weight": 400
            },
            "zOrder": 100
        },
        {
            "key": "mute_indicator",
            "type": "pixmap",
            "rect": [108, 8, 128, 28],
            "zOrder": 200
        }
    ]
}
```

### Advanced Feedback Updates

```typescript
class VolumeDialAction extends SingletonAction<VolumeSettings> {
    
    override async onWillAppear(ev: WillAppearEvent<VolumeSettings>): Promise<void> {
        // Set custom layout
        await ev.action.setFeedbackLayout("layouts/volume-control.json");
        
        // Initialize feedback
        await this.updateFeedback(ev.action, ev.payload.settings.volume);
    }
    
    private async updateFeedback(
        action: DialAction<VolumeSettings>, 
        volume: number,
        isPressed: boolean = false,
        isMuted: boolean = false
    ): Promise<void> {
        
        // Dynamic icon based on volume level
        const volumeIcon = this.getVolumeIcon(volume, isMuted);
        
        // Color changes based on state
        const barColor = isPressed ? "#FFD700" : isMuted ? "#FF4444" : "#00D4FF";
        const titleColor = isMuted ? "#FF4444" : "#FFFFFF";
        
        await action.setFeedback({
            icon: volumeIcon,
            title: {
                value: isMuted ? "MUTED" : "Volume",
                color: titleColor
            },
            volume_bar: {
                value: isMuted ? 0 : volume,
                bar_fill_c: barColor,
                opacity: isPressed ? 0.8 : 1.0
            },
            volume_text: {
                value: isMuted ? "MUTED" : `${volume}%`,
                color: titleColor
            },
            mute_indicator: isMuted ? this.getMuteIcon() : undefined
        });
    }
    
    private getVolumeIcon(volume: number, muted: boolean): string {
        if (muted) return "data:image/svg+xml;base64,..."; // Mute icon
        if (volume === 0) return "data:image/svg+xml;base64,..."; // Volume 0
        if (volume < 33) return "data:image/svg+xml;base64,..."; // Volume low
        if (volume < 66) return "data:image/svg+xml;base64,..."; // Volume medium
        return "data:image/svg+xml;base64,..."; // Volume high
    }
}
```

## Manifest Configuration

### Encoder Action Manifest

```json
{
  "Actions": [
    {
      "Name": "Volume Control",
      "UUID": "com.company.plugin.volume",
      "Icon": "imgs/actions/volume/icon",
      "Controllers": ["Encoder"], // Only available on dials
      "Encoder": {
        "layout": "$B1",
        "TriggerDescription": {
          "Rotate": "Adjust volume level",
          "Push": "Toggle mute",
          "Touch": "Quick volume adjust",
          "LongTouch": "Open audio settings"
        }
      },
      "States": [{
        "Image": "imgs/actions/volume/dial-icon"
      }]
    }
  ]
}
```

### Multi-Controller Actions

Actions that work on both keys and dials:

```json
{
  "Actions": [
    {
      "Name": "Media Control",
      "UUID": "com.company.plugin.media",
      "Icon": "imgs/actions/media/icon",
      "Controllers": ["Keypad", "Encoder"], // Available on both
      "Encoder": {
        "layout": "$C1",
        "TriggerDescription": {
          "Rotate": "Seek forward/backward",
          "Push": "Play/Pause",
          "Touch": "Show track info"
        }
      },
      "States": [{
        "Image": "imgs/actions/media/play"
      }, {
        "Image": "imgs/actions/media/pause"
      }]
    }
  ]
}
```

## Controller-Specific Logic

### Handling Different Controllers

```typescript
@action({ UUID: "com.company.plugin.universal" })
export class UniversalAction extends SingletonAction<Settings> {
    
    override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
        if (ev.action.isDial()) {
            // Dial-specific initialization
            await ev.action.setFeedbackLayout("$B2");
            await this.initializeDial(ev.action);
        } else if (ev.action.isKey()) {
            // Key-specific initialization 
            await ev.action.setImage(this.getKeyIcon());
        }
    }
    
    // Key interactions
    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        await this.performQuickAction();
        await ev.action.showOk();
    }
    
    // Dial interactions
    override async onDialRotate(ev: DialRotateEvent<Settings>): Promise<void> {
        const value = await this.adjustValue(ev.payload.ticks);
        await this.updateDialDisplay(ev.action, value);
    }
    
    override async onTouchTap(ev: TouchTapEvent<Settings>): Promise<void> {
        await this.showDetailedInfo(ev.action);
    }
}
```

### Type Guards and Detection

```typescript
// Utility functions for controller detection
function isDialAction(action: DialAction | KeyAction): action is DialAction {
    return action.controllerType === "Encoder";
}

function isKeyAction(action: DialAction | KeyAction): action is KeyAction {
    return action.controllerType === "Keypad";
}

// Usage in event handlers
override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    const action = ev.action;
    
    if (isDialAction(action)) {
        // TypeScript now knows action is DialAction
        await action.setFeedback({ title: "Dial Mode" });
        console.log("Dial coordinates:", action.coordinates);
    } else {
        // TypeScript knows action is KeyAction
        await action.setTitle("Key Mode");
    }
}
```

## Advanced Interaction Patterns

### Debounced Dial Updates

```typescript
class DebouncedDialAction extends SingletonAction<Settings> {
    private updateTimers = new Map<string, NodeJS.Timeout>();
    private pendingValues = new Map<string, number>();
    
    override async onDialRotate(ev: DialRotateEvent<Settings>): Promise<void> {
        const context = ev.action.id;
        const { ticks } = ev.payload;
        
        // Accumulate ticks
        const currentPending = this.pendingValues.get(context) || 0;
        const newPending = currentPending + ticks;
        this.pendingValues.set(context, newPending);
        
        // Clear existing timer
        if (this.updateTimers.has(context)) {
            clearTimeout(this.updateTimers.get(context)!);
        }
        
        // Immediate visual feedback
        await this.updateDisplayOnly(ev.action, newPending);
        
        // Debounced actual update
        this.updateTimers.set(context, setTimeout(async () => {
            const finalValue = this.pendingValues.get(context) || 0;
            await this.performActualUpdate(ev.action, finalValue);
            
            this.pendingValues.delete(context);
            this.updateTimers.delete(context);
        }, 300));
    }
    
    private async updateDisplayOnly(action: DialAction, value: number): Promise<void> {
        // Fast visual update without system changes
        await action.setFeedback({
            title: "Adjusting...",
            value: `${value}`,
            volume_bar: value
        });
    }
    
    private async performActualUpdate(action: DialAction, value: number): Promise<void> {
        // Actual system change after debounce
        await this.applySystemChange(value);
        await action.setFeedback({
            title: "Volume",
            value: `${value}%`,
            volume_bar: value
        });
    }
}
```

### Multi-Touch Gestures

```typescript
class GestureDialAction extends SingletonAction<Settings> {
    private lastTapTime = 0;
    private tapCount = 0;
    
    override async onTouchTap(ev: TouchTapEvent<Settings>): Promise<void> {
        const now = Date.now();
        const { tapPos, hold } = ev.payload;
        const [x, y] = tapPos;
        
        if (hold) {
            // Long press gesture
            await this.handleLongPress(ev.action, x, y);
            return;
        }
        
        // Multi-tap detection
        if (now - this.lastTapTime < 500) {
            this.tapCount++;
        } else {
            this.tapCount = 1;
        }
        this.lastTapTime = now;
        
        // Handle based on tap count and position
        setTimeout(async () => {
            if (this.tapCount === 1) {
                await this.handleSingleTap(ev.action, x, y);
            } else if (this.tapCount === 2) {
                await this.handleDoubleTap(ev.action, x, y);
            } else if (this.tapCount >= 3) {
                await this.handleTripleTap(ev.action);
            }
            this.tapCount = 0;
        }, 500);
    }
    
    private async handleSingleTap(action: DialAction, x: number, y: number): Promise<void> {
        // Zone-based actions
        if (x < 48) {
            await this.handleLeftZone(action);
        } else if (x > 96) {
            await this.handleRightZone(action);
        } else {
            await this.handleCenterZone(action);
        }
    }
    
    private async handleDoubleTap(action: DialAction, x: number, y: number): Promise<void> {
        // Quick toggle or reset
        await this.resetToDefault(action);
    }
    
    private async handleTripleTap(action: DialAction): Promise<void> {
        // Advanced function
        await this.openAdvancedSettings(action);
    }
}
```

### Contextual Feedback

```typescript
class ContextualDialAction extends SingletonAction<Settings> {
    
    override async onDialRotate(ev: DialRotateEvent<Settings>): Promise<void> {
        const { ticks, pressed } = ev.payload;
        const { mode = "volume" } = ev.payload.settings;
        
        // Different behavior based on mode and press state
        switch (mode) {
            case "volume":
                if (pressed) {
                    // Fine volume adjustment
                    await this.adjustVolume(ticks * 0.5);
                    await this.showFineAdjustmentFeedback(ev.action);
                } else {
                    // Coarse volume adjustment
                    await this.adjustVolume(ticks * 2);
                    await this.showCoarseAdjustmentFeedback(ev.action);
                }
                break;
                
            case "brightness":
                await this.adjustBrightness(ticks);
                await this.showBrightnessFeedback(ev.action);
                break;
                
            case "bass":
                await this.adjustBass(ticks);
                await this.showEQFeedback(ev.action, "bass");
                break;
        }
    }
    
    private async showFineAdjustmentFeedback(action: DialAction): Promise<void> {
        await action.setFeedback({
            title: { value: "FINE", color: "#FFD700" },
            icon: this.getFineIcon(),
            volume_bar: { bar_fill_c: "#FFD700" }
        });
        
        // Reset feedback after delay
        setTimeout(async () => {
            await this.showNormalFeedback(action);
        }, 1500);
    }
}
```

## Device Compatibility

### Checking Device Capabilities

```typescript
// Check if device supports encoders
function supportsEncoders(device: Device): boolean {
    return device.type === DeviceType.StreamDeckPlus;
}

// Get available dial positions
function getDialPositions(device: Device): Coordinates[] {
    if (device.type === DeviceType.StreamDeckPlus) {
        return [
            { row: 0, column: 0 },
            { row: 0, column: 1 },
            { row: 0, column: 2 },
            { row: 0, column: 3 }
        ];
    }
    return [];
}

// Runtime device detection
override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    const device = ev.action.device;
    
    if (supportsEncoders(device) && ev.action.isDial()) {
        await this.initializeDialFeatures(ev.action);
    } else {
        await this.fallbackToKeyMode(ev.action);
    }
}
```

## Performance Optimization

### Efficient Feedback Updates

```typescript
class OptimizedDialAction extends SingletonAction<Settings> {
    private lastUpdateTime = 0;
    private pendingUpdate: any = null;
    
    override async onDialRotate(ev: DialRotateEvent<Settings>): Promise<void> {
        const now = performance.now();
        
        // Throttle updates to 60fps max
        if (now - this.lastUpdateTime < 16.67) {
            if (this.pendingUpdate) {
                clearTimeout(this.pendingUpdate);
            }
            
            this.pendingUpdate = setTimeout(() => {
                this.performUpdate(ev);
            }, 16.67);
            return;
        }
        
        await this.performUpdate(ev);
        this.lastUpdateTime = now;
    }
    
    private async performUpdate(ev: DialRotateEvent<Settings>): Promise<void> {
        // Batch multiple property updates
        const updates = {
            title: this.getTitle(ev.payload.settings),
            value: this.getValue(ev.payload.settings),
            volume_bar: this.getBarValue(ev.payload.settings)
        };
        
        await ev.action.setFeedback(updates);
    }
}
```

## Troubleshooting

### Common Issues

#### 1. Layout Not Updating

```typescript
// ❌ Wrong - forgetting to set layout first
await action.setFeedback({ title: "Test" }); // Won't work without layout

// ✅ Correct - set layout then feedback
await action.setFeedbackLayout("$B1");
await action.setFeedback({ title: "Test" });
```

#### 2. TouchTap Not Firing

```typescript
// Ensure dial action is properly configured
if (!ev.action.isDial()) {
    console.warn("TouchTap only works on dial actions");
    return;
}
```

#### 3. Coordinates Confusion

```typescript
// Remember: Dial coordinates are ALWAYS row: 0
const dialCoords = ev.payload.coordinates; // { row: 0, column: 0-3 }
const keyCoords = ev.payload.coordinates;  // { row: 0-1, column: 0-3 }
```

### Debug Logging

```typescript
override async onDialRotate(ev: DialRotateEvent<Settings>): Promise<void> {
    streamDeck.logger.info(`[Dial] Rotate: ticks=${ev.payload.ticks}, pressed=${ev.payload.pressed}`);
    streamDeck.logger.info(`[Dial] Coordinates: ${JSON.stringify(ev.payload.coordinates)}`);
    streamDeck.logger.info(`[Dial] Settings: ${JSON.stringify(ev.payload.settings)}`);
}

override async onTouchTap(ev: TouchTapEvent<Settings>): Promise<void> {
    const [x, y] = ev.payload.tapPos;
    streamDeck.logger.info(`[Touch] Tap at (${x}, ${y}), hold=${ev.payload.hold}`);
}
```

## Best Practices

### 1. Responsive Feedback

- **Immediate**: Visual feedback should be instant (< 16ms)
- **Debounced**: System changes should be debounced (300ms)
- **Progressive**: Show progress during long operations

### 2. Intuitive Interactions

- **Rotation**: Primary value adjustment
- **Press + Rotate**: Fine adjustment or alternate mode
- **Tap**: Quick actions based on zones
- **Long Tap**: Advanced options or settings

### 3. Visual Hierarchy

- **Title**: Current mode or function name
- **Value**: Current setting value
- **Bar/Graph**: Visual representation of value
- **Icon**: Mode indicator or status

### 4. Error Handling

```typescript
override async onDialRotate(ev: DialRotateEvent<Settings>): Promise<void> {
    try {
        await this.performAdjustment(ev);
        await ev.action.setFeedback({ 
            title: "Success",
            icon: this.getSuccessIcon() 
        });
    } catch (error) {
        streamDeck.logger.error(`Dial adjustment failed: ${error.message}`);
        await ev.action.setFeedback({ 
            title: "Error",
            icon: this.getErrorIcon(),
            title_color: "#FF4444"
        });
    }
}
```

## Migration from Key Actions

### Converting Key to Dial Actions

```typescript
// Before (Key Action)
@action({ UUID: "com.company.volume" })
export class VolumeKeyAction extends SingletonAction<Settings> {
    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        let { volume = 50 } = ev.payload.settings;
        volume = Math.min(100, volume + 10);
        
        await ev.action.setSettings({ volume });
        await ev.action.setTitle(`${volume}%`);
    }
}

// After (Dial Action)
@action({ UUID: "com.company.volume.dial" })
export class VolumeDialAction extends SingletonAction<Settings> {
    override async onDialRotate(ev: DialRotateEvent<Settings>): Promise<void> {
        let { volume = 50 } = ev.payload.settings;
        volume = Math.max(0, Math.min(100, volume + ev.payload.ticks));
        
        await ev.action.setSettings({ volume });
        await ev.action.setFeedback({
            title: "Volume",
            value: `${volume}%`,
            volume_bar: volume / 100
        });
    }
    
    override async onDialDown(ev: DialDownEvent<Settings>): Promise<void> {
        // Dial press replaces key press
        const { muted = false } = ev.payload.settings;
        await ev.action.setSettings({ ...ev.payload.settings, muted: !muted });
    }
}
```

## Complete Example: System Monitor Dial

```typescript
import { 
    action, 
    SingletonAction, 
    DialRotateEvent, 
    TouchTapEvent,
    WillAppearEvent 
} from "@elgato/streamdeck";

interface SystemMonitorSettings {
    metric: "cpu" | "ram" | "disk" | "network";
    refreshRate: number;
    alertThreshold: number;
}

@action({ UUID: "com.company.system-monitor" })
export class SystemMonitorDial extends SingletonAction<SystemMonitorSettings> {
    private updateInterval?: NodeJS.Timeout;
    private metrics = {
        cpu: 0,
        ram: 0, 
        disk: 0,
        network: 0
    };
    
    override async onWillAppear(ev: WillAppearEvent<SystemMonitorSettings>): Promise<void> {
        // Set advanced layout
        await ev.action.setFeedbackLayout("layouts/system-monitor.json");
        
        // Start monitoring
        await this.startMonitoring(ev.action);
        
        // Initial update
        await this.updateDisplay(ev.action, ev.payload.settings);
    }
    
    override async onWillDisappear(): Promise<void> {
        // Cleanup
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
    
    override async onDialRotate(ev: DialRotateEvent<SystemMonitorSettings>): Promise<void> {
        // Cycle through metrics
        const metrics: Array<SystemMonitorSettings["metric"]> = ["cpu", "ram", "disk", "network"];
        const { metric = "cpu" } = ev.payload.settings;
        const currentIndex = metrics.indexOf(metric);
        const newIndex = (currentIndex + Math.sign(ev.payload.ticks) + metrics.length) % metrics.length;
        
        await ev.action.setSettings({ 
            ...ev.payload.settings, 
            metric: metrics[newIndex] 
        });
        
        await this.updateDisplay(ev.action, { ...ev.payload.settings, metric: metrics[newIndex] });
    }
    
    override async onTouchTap(ev: TouchTapEvent<SystemMonitorSettings>): Promise<void> {
        const [x, y] = ev.payload.tapPos;
        
        if (ev.payload.hold) {
            // Long press - open system monitor
            await this.openSystemMonitor();
        } else if (y < 48) {
            // Top zone - refresh
            await this.refreshMetrics(ev.action, ev.payload.settings);
        } else {
            // Bottom zone - toggle alert threshold
            await this.cycleAlertThreshold(ev.action, ev.payload.settings);
        }
    }
    
    private async startMonitoring(action: DialAction<SystemMonitorSettings>): Promise<void> {
        this.updateInterval = setInterval(async () => {
            this.metrics.cpu = await this.getCPUUsage();
            this.metrics.ram = await this.getRAMUsage();
            this.metrics.disk = await this.getDiskUsage();
            this.metrics.network = await this.getNetworkUsage();
            
            const settings = await action.getSettings();
            await this.updateDisplay(action, settings);
        }, 2000);
    }
    
    private async updateDisplay(
        action: DialAction<SystemMonitorSettings>, 
        settings: SystemMonitorSettings
    ): Promise<void> {
        const { metric, alertThreshold = 80 } = settings;
        const value = this.metrics[metric];
        const isAlert = value > alertThreshold;
        
        const displayNames = {
            cpu: "CPU Usage",
            ram: "RAM Usage", 
            disk: "Disk Usage",
            network: "Network"
        };
        
        const icons = {
            cpu: this.getCPUIcon(value, isAlert),
            ram: this.getRAMIcon(value, isAlert),
            disk: this.getDiskIcon(value, isAlert),
            network: this.getNetworkIcon(value, isAlert)
        };
        
        await action.setFeedback({
            title: {
                value: displayNames[metric],
                color: isAlert ? "#FF4444" : "#FFFFFF"
            },
            icon: icons[metric],
            usage_bar: {
                value: value / 100,
                bar_fill_c: isAlert ? "#FF4444" : "#00D4FF",
                opacity: isAlert ? 0.9 : 0.7
            },
            percentage: {
                value: `${Math.round(value)}%`,
                color: isAlert ? "#FF4444" : "#FFFFFF"
            },
            alert_icon: isAlert ? this.getAlertIcon() : undefined
        });
    }
    
    // System monitoring methods...
    private async getCPUUsage(): Promise<number> { /* ... */ return 45; }
    private async getRAMUsage(): Promise<number> { /* ... */ return 62; }
    private async getDiskUsage(): Promise<number> { /* ... */ return 78; }
    private async getNetworkUsage(): Promise<number> { /* ... */ return 12; }
}
```

This comprehensive guide covers all aspects of Stream Deck Plus development, from basic dial interactions to advanced feedback systems and performance optimization. The encoder actions provide rich, dynamic interfaces that enhance user experience beyond traditional button-based controls.

---

The Stream Deck Plus represents the future of hardware control interfaces, and mastering its capabilities allows developers to create truly innovative and intuitive plugin experiences.