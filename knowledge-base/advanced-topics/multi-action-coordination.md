# Multi-Action Coordination

## Overview

Plugins often contain multiple actions that need to share state, react to each other's changes, or coordinate visual updates. This guide covers patterns for coordinating across action instances using shared state, an event bus, and direct communication through the SDK.

## Communication Patterns

### Pattern 1: Shared Module-Level State

The simplest approach for actions within the same plugin: share state via a module-level singleton.

```typescript
// state/pluginState.ts
export interface PluginState {
    isConnected: boolean;
    activeProfile: string;
    lastEvent: string | null;
}

class PluginStateManager {
    private state: PluginState = {
        isConnected: false,
        activeProfile: "default",
        lastEvent: null,
    };
    private listeners = new Set<(state: PluginState) => void>();

    getState(): Readonly<PluginState> {
        return this.state;
    }

    setState(patch: Partial<PluginState>): void {
        this.state = { ...this.state, ...patch };
        this.notify();
    }

    subscribe(listener: (state: PluginState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);  // returns unsubscribe fn
    }

    private notify() {
        this.listeners.forEach((fn) => fn(this.state));
    }
}

// Singleton — imported by all actions
export const pluginState = new PluginStateManager();
```

```typescript
// actions/statusAction.ts
import { pluginState } from "../state/pluginState";

@action({ UUID: "com.example.plugin.status" })
export class StatusAction extends SingletonAction<Settings> {
    private unsubscribe?: () => void;

    override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
        // Subscribe to state changes and update the button
        this.unsubscribe = pluginState.subscribe(async (state) => {
            await ev.action.setTitle(state.isConnected ? "ON" : "OFF");
            await ev.action.setImage(state.isConnected ? "images/on" : "images/off");
        });

        // Set initial state
        const state = pluginState.getState();
        await ev.action.setTitle(state.isConnected ? "ON" : "OFF");
    }

    override onWillDisappear(_ev: WillDisappearEvent<Settings>): void {
        this.unsubscribe?.();
    }
}
```

```typescript
// actions/connectAction.ts
import { pluginState } from "../state/pluginState";

@action({ UUID: "com.example.plugin.connect" })
export class ConnectAction extends SingletonAction<Settings> {
    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const { isConnected } = pluginState.getState();
        if (isConnected) {
            await this.disconnect();
        } else {
            await this.connect();
        }
    }

    private async connect() {
        // ... connection logic ...
        pluginState.setState({ isConnected: true, lastEvent: "connected" });
    }

    private async disconnect() {
        // ... disconnection logic ...
        pluginState.setState({ isConnected: false, lastEvent: "disconnected" });
    }
}
```

### Pattern 2: Event Bus

An event bus decouples senders from receivers — actions emit typed events without knowing who listens.

```typescript
// events/eventBus.ts
type Listener<T> = (payload: T) => void | Promise<void>;

class TypedEventBus {
    private listeners = new Map<string, Set<Listener<any>>>();

    on<T>(event: string, callback: Listener<T>): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
        return () => this.listeners.get(event)?.delete(callback);
    }

    async emit<T>(event: string, payload: T): Promise<void> {
        const handlers = this.listeners.get(event);
        if (!handlers) return;
        await Promise.all([...handlers].map((fn) => fn(payload)));
    }
}

export const bus = new TypedEventBus();

// Define event names as constants to avoid typos
export const EVENTS = {
    CONNECTED:    "connection:connected",
    DISCONNECTED: "connection:disconnected",
    DATA_UPDATED: "data:updated",
    PROFILE_CHANGED: "profile:changed",
} as const;
```

```typescript
// Usage in any action
import { bus, EVENTS } from "../events/eventBus";

// Emit
bus.emit(EVENTS.DATA_UPDATED, { value: 42, unit: "°C" });

// Listen
const unsub = bus.on<{ value: number; unit: string }>(
    EVENTS.DATA_UPDATED,
    async ({ value, unit }) => {
        await action.setTitle(`${value}${unit}`);
    }
);
// Later: unsub() to clean up
```

### Pattern 3: Iterating All Action Instances

The SDK provides `streamDeck.actions.forEach()` to touch every visible action instance at once:

```typescript
import { streamDeck } from "@elgato/streamdeck";

// Update all instances of a specific action type
function updateAllStatusActions(text: string) {
    streamDeck.actions.forEach(async (action) => {
        if (action.manifestId === "com.example.plugin.status") {
            await action.setTitle(text);
        }
    });
}
```

## State Synchronization

### Initializing State from External Source on Start

```typescript
// Load initial state once when plugin starts
async function initializeState() {
    try {
        const data = await fetchCurrentStatus();
        pluginState.setState({
            isConnected: data.connected,
            activeProfile: data.profile,
        });
    } catch (err) {
        streamDeck.logger.error("Failed to load initial state:", err);
    }
}

// Call before streamDeck.connect()
await initializeState();
streamDeck.connect();
```

### Keeping PI and Plugin in Sync

When the shared state changes, push updates to any open Property Inspector:

```typescript
pluginState.subscribe(async (state) => {
    // Push state to the visible Property Inspector, when one is open.
    await streamDeck.ui.sendToPropertyInspector({
        type: "state-update",
        state,
    });
});
```

## Coordinated Animations

### Synchronized Key Animations Across Multiple Buttons

```typescript
// Blink a row of keys in unison
const BLINK_ACTION_UUID = "com.example.plugin.blinker";
let blinkInterval: NodeJS.Timeout | undefined;

function startBlinkAnimation() {
    let on = false;
    blinkInterval = setInterval(() => {
        on = !on;
        streamDeck.actions.forEach(async (action) => {
            if (action.manifestId === BLINK_ACTION_UUID) {
                await action.setImage(on ? "images/blink-on" : "images/blink-off");
            }
        });
    }, 500);
}

function stopBlinkAnimation() {
    clearInterval(blinkInterval);
    blinkInterval = undefined;
}
```

### Staggered Animation (Wave Effect)

```typescript
function startWaveAnimation(actionIds: string[]) {
    actionIds.forEach((id, index) => {
        setTimeout(() => {
            streamDeck.actions.forEach(async (action) => {
                if (action.id === id) {
                    await action.setState(1);
                    setTimeout(() => action.setState(0), 300);
                }
            });
        }, index * 150); // 150ms stagger between each key
    });
}
```

## Action Dependencies

### Parent-Child Pattern

One "controller" action drives the state; other actions are "display" actions that reflect it:

```typescript
// controller.ts — drives state
@action({ UUID: "com.example.plugin.controller" })
export class ControllerAction extends SingletonAction<ControllerSettings> {
    override async onKeyDown(ev: KeyDownEvent<ControllerSettings>): Promise<void> {
        const newValue = (ev.payload.settings.value ?? 0) + 1;
        await ev.action.setSettings({ value: newValue });
        // Broadcast to all display actions
        pluginState.setState({ displayValue: newValue });
    }
}

// display.ts — reflects state
@action({ UUID: "com.example.plugin.display" })
export class DisplayAction extends SingletonAction<{}> {
    override async onWillAppear(ev: WillAppearEvent<{}>): Promise<void> {
        const unsub = pluginState.subscribe(async (state) => {
            await ev.action.setTitle(String(state.displayValue ?? 0));
        });
        // Store unsub so we can call it in onWillDisappear
        this.unsubscribers.set(ev.action.id, unsub);
    }

    override onWillDisappear(ev: WillDisappearEvent<{}>): void {
        this.unsubscribers.get(ev.action.id)?.();
        this.unsubscribers.delete(ev.action.id);
    }

    private unsubscribers = new Map<string, () => void>();
}
```

## State Machine Across Multiple Actions

For complex flows (e.g., a game or multi-step workflow), use a shared state machine:

```typescript
// state/gameMachine.ts
type GameState = "idle" | "playing" | "paused" | "game-over";

type GameContext = {
    score: number;
    lives: number;
    level: number;
};

class GameMachine {
    private state: GameState = "idle";
    private context: GameContext = { score: 0, lives: 3, level: 1 };
    private readonly transitions: Record<GameState, Partial<Record<string, GameState>>> = {
        idle:      { START: "playing" },
        playing:   { PAUSE: "paused", LOSE_LIFE: "playing", GAME_OVER: "game-over" },
        paused:    { RESUME: "playing", QUIT: "idle" },
        "game-over": { RESTART: "idle" },
    };

    send(event: string, payload?: Partial<GameContext>): GameState {
        const nextState = this.transitions[this.state]?.[event];
        if (!nextState) {
            streamDeck.logger.warn(`Invalid transition: ${this.state} + ${event}`);
            return this.state;
        }
        this.state = nextState;
        if (payload) this.context = { ...this.context, ...payload };
        bus.emit("game:stateChanged", { state: this.state, context: this.context });
        return this.state;
    }

    getState() { return this.state; }
    getContext() { return { ...this.context }; }
}

export const game = new GameMachine();
```

```typescript
// Start button action
@action({ UUID: "com.example.game.start" })
export class StartAction extends SingletonAction<{}> {
    override async onKeyDown(_ev: KeyDownEvent<{}>): Promise<void> {
        game.send("START");
    }
}

// Score display action
@action({ UUID: "com.example.game.score" })
export class ScoreAction extends SingletonAction<{}> {
    override async onWillAppear(ev: WillAppearEvent<{}>): Promise<void> {
        bus.on("game:stateChanged", async ({ context }) => {
            await ev.action.setTitle(`${context.score}`);
        });
    }
}
```

## Example: Synchronized Controls (Volume Group)

```typescript
// Shared volume state
const volumeState = { level: 50, muted: false };

// Volume up action
@action({ UUID: "com.example.audio.volume-up" })
export class VolumeUpAction extends SingletonAction<{}> {
    override async onKeyDown(_ev: KeyDownEvent<{}>): Promise<void> {
        volumeState.level = Math.min(100, volumeState.level + 5);
        await applyVolume(volumeState);
        bus.emit("volume:changed", volumeState);
    }
}

// Volume down action
@action({ UUID: "com.example.audio.volume-down" })
export class VolumeDownAction extends SingletonAction<{}> {
    override async onKeyDown(_ev: KeyDownEvent<{}>): Promise<void> {
        volumeState.level = Math.max(0, volumeState.level - 5);
        await applyVolume(volumeState);
        bus.emit("volume:changed", volumeState);
    }
}

// Mute toggle — also listens to changes from other actions
@action({ UUID: "com.example.audio.mute" })
export class MuteAction extends SingletonAction<{}> {
    override async onWillAppear(ev: WillAppearEvent<{}>): Promise<void> {
        bus.on<typeof volumeState>("volume:changed", async (v) => {
            await ev.action.setTitle(v.muted ? "🔇" : "🔊");
        });
    }

    override async onKeyDown(ev: KeyDownEvent<{}>): Promise<void> {
        volumeState.muted = !volumeState.muted;
        await applyVolume(volumeState);
        bus.emit("volume:changed", volumeState);
    }
}
```

## Best Practices

1. **Prefer module-level singletons** over global variables — they're easier to test and import cleanly
2. **Always clean up subscriptions** in `onWillDisappear` to prevent memory leaks
3. **Don't call `setImage` / `setTitle` from every subscriber** if many actions are subscribed — batch updates or throttle them
4. **Use typed event payloads** — define TypeScript interfaces for all event data
5. **Avoid circular dependencies** between action files — keep shared state in a separate `state/` directory
6. **Test state transitions** independently of the Stream Deck SDK — mock the actions in unit tests
7. **Keep state mutations synchronous** where possible; async state changes can cause race conditions
8. **Log state transitions** at `debug` level for troubleshooting: `streamDeck.logger.debug("State → connected")`

---

**Related Documentation**:
- [Action Development](../core-concepts/action-development.md)
- [Managing Multiple Instances](./managing-multiple-instances.md)
- [Real-World Examples](../examples/real-world-plugin-examples.md)
