# Managing Multiple Action Instances

> **Status**: ✅ Complete

## Overview

This guide covers advanced patterns for managing multiple instances of the same action across different devices or multiple buttons on the same device. This is particularly important for plugins that connect to external services and need to maintain per-instance state while efficiently managing shared resources like event listeners and API subscriptions.

## When This Pattern Is Needed

### ✅ Use This Pattern When:
- Plugin connects to external services (APIs, WebSockets, databases)
- Actions subscribe to real-time data updates
- Each button instance needs independent state (e.g., tracking deltas, timers)
- Global event listeners need to update all instances
- Resource cleanup is critical (subscriptions, timers, connections)

### ❌ Not Needed For:
- Simple self-contained actions (counters, toggles)
- Actions that only use settings persistence
- Actions without external subscriptions
- Single-action plugins with no shared resources

## The Problem

### Without Proper Instance Management

```typescript
// ❌ ANTI-PATTERN: Single action reference
@action({ UUID: "com.company.plugin.data" })
export class DataAction extends SingletonAction {
    private currentAction?: Action; // Only tracks ONE instance!
    private subscription?: () => void;
    
    override async onWillAppear(ev: WillAppearEvent): Promise<void> {
        this.currentAction = ev.action; // Overwrites previous instances
        
        // Subscribes multiple times - resource leak!
        this.subscription = dataService.subscribe(data => {
            this.currentAction?.setTitle(data.value); // Only updates last instance
        });
    }
}
```

**Issues**:
- All instances share same `currentAction` reference
- Updating one button affects all instances incorrectly
- Event listeners and subscriptions registered multiple times (memory leak)
- Per-instance state (like deltas) shared across all buttons
- Only the last instance receives updates

### With Proper Instance Management

```typescript
// ✅ CORRECT: Map-based instance tracking
@action({ UUID: "com.company.plugin.data" })
export class DataAction extends SingletonAction {
    private instances: Map<string, ActionInstance> = new Map();
    private subscription?: () => void;
    
    override async onWillAppear(ev: WillAppearEvent): Promise<void> {
        // Track each instance independently
        this.instances.set(ev.action.id, { action: ev.action });
        
        // Subscribe ONCE when first instance appears
        if (this.instances.size === 1) {
            this.subscription = dataService.subscribe(data => {
                // Update ALL instances
                for (const instance of this.instances.values()) {
                    instance.action.setTitle(data.value);
                }
            });
        }
    }
    
    override async onWillDisappear(ev: WillDisappearEvent): Promise<void> {
        this.instances.delete(ev.action.id);
        
        // Cleanup ONLY when last instance is removed
        if (this.instances.size === 0 && this.subscription) {
            this.subscription();
            this.subscription = undefined;
        }
    }
}
```

## Implementation Pattern

### Step 1: Define Instance Interface

```typescript
interface ActionInstance {
    action: Action;
    // Add per-instance state if needed
    previousValue?: number;
    startTime?: number;
}
```

### Step 2: Replace Single Reference with Map

```typescript
@action({ UUID: "com.company.plugin.action" })
export class MyAction extends SingletonAction<Settings> {
    // Replace this:
    // private currentAction?: Action;
    
    // With this:
    private instances: Map<string, ActionInstance> = new Map();
    
    // Track shared subscriptions
    private dataSubscription?: () => void;
    private eventUnsubscribe?: () => void;
}
```

### Step 3: Update onWillAppear

```typescript
override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    // 1. Add instance to Map
    this.instances.set(ev.action.id, {
        action: ev.action,
        previousValue: undefined // Initialize per-instance state
    });
    
    // 2. Register global listeners ONLY on first instance
    if (this.instances.size === 1) {
        // Subscribe to data service
        this.dataSubscription = dataService.subscribe(
            'dataType',
            async (data) => {
                await this.updateAllInstances(data);
            }
        );
        
        // Register event listeners
        eventBus.on('dataUpdated', this.handleDataUpdate);
    }
    
    // 3. Initialize this instance
    const initialData = await dataService.getCurrentData();
    await this.updateDisplay(this.instances.get(ev.action.id)!, initialData);
}
```

### Step 4: Update onWillDisappear

```typescript
override async onWillDisappear(ev: WillDisappearEvent<Settings>): Promise<void> {
    // 1. Remove instance from Map
    this.instances.delete(ev.action.id);
    
    // 2. Cleanup ONLY when last instance is removed
    if (this.instances.size === 0) {
        // Unsubscribe from data service
        if (this.dataSubscription) {
            this.dataSubscription();
            this.dataSubscription = undefined;
        }
        
        // Unregister event listeners
        eventBus.off('dataUpdated', this.handleDataUpdate);
        
        // Clear any shared state
        this.clearSharedResources();
    }
    
    streamDeck.logger.debug(`Instance ${ev.action.id} disappeared`);
}
```

### Step 5: Add Update Methods

```typescript
/**
 * Update all instances with the same data
 */
private async updateAllInstances(data: DataType): Promise<void> {
    for (const instance of this.instances.values()) {
        await this.updateDisplay(instance, data);
    }
}

/**
 * Update a single instance's display
 */
private async updateDisplay(
    instance: ActionInstance,
    data: DataType
): Promise<void> {
    const lines: string[] = [];
    
    lines.push(data.value);
    
    // Use per-instance state for delta calculations
    if (instance.previousValue !== undefined) {
        const delta = data.value - instance.previousValue;
        if (delta !== 0) {
            lines.push(`${delta > 0 ? '+' : ''}${delta}`);
        }
    }
    
    // Update per-instance state
    instance.previousValue = data.value;
    
    await instance.action.setTitle(lines.join('\n'));
}
```

### Step 6: Handle Global Events

```typescript
/**
 * Event handler that updates all instances
 */
private handleDataUpdate = async (data: DataType): Promise<void> => {
    if (this.instances.size === 0) {
        return; // No instances to update
    }
    
    streamDeck.logger.debug('Updating all instances with new data');
    
    await this.updateAllInstances(data);
};
```

## Complete Example

```typescript
import streamDeck, {
    action,
    SingletonAction,
    WillAppearEvent,
    WillDisappearEvent,
    KeyDownEvent
} from "@elgato/streamdeck";

interface DataInstance {
    action: Action;
    previousValue?: number;
    refreshTimer?: NodeJS.Timeout;
}

interface DataSettings {
    refreshInterval: number;
}

@action({ UUID: "com.company.plugin.data-monitor" })
export class DataMonitor extends SingletonAction<DataSettings> {
    private instances: Map<string, DataInstance> = new Map();
    private dataSubscription?: () => void;
    
    override async onWillAppear(ev: WillAppearEvent<DataSettings>): Promise<void> {
        const { refreshInterval = 5000 } = ev.payload.settings;
        
        // Add instance
        this.instances.set(ev.action.id, {
            action: ev.action,
            previousValue: undefined
        });
        
        // Subscribe to data on first instance
        if (this.instances.size === 1) {
            this.dataSubscription = await this.subscribeToData();
        }
        
        // Set up per-instance refresh timer if needed
        if (refreshInterval > 0) {
            const instance = this.instances.get(ev.action.id)!;
            instance.refreshTimer = setInterval(async () => {
                const data = await this.fetchData();
                await this.updateDisplay(instance, data);
            }, refreshInterval);
        }
        
        // Initial update
        const data = await this.fetchData();
        await this.updateDisplay(this.instances.get(ev.action.id)!, data);
    }
    
    override async onWillDisappear(ev: WillDisappearEvent<DataSettings>): Promise<void> {
        const instance = this.instances.get(ev.action.id);
        
        // Clear per-instance timer
        if (instance?.refreshTimer) {
            clearInterval(instance.refreshTimer);
        }
        
        // Remove instance
        this.instances.delete(ev.action.id);
        
        // Cleanup global resources when last instance removed
        if (this.instances.size === 0) {
            if (this.dataSubscription) {
                this.dataSubscription();
                this.dataSubscription = undefined;
            }
        }
    }
    
    override async onKeyDown(ev: KeyDownEvent<DataSettings>): Promise<void> {
        // Refresh this specific instance
        const instance = this.instances.get(ev.action.id);
        if (instance) {
            const data = await this.fetchData();
            await this.updateDisplay(instance, data);
            await ev.action.showOk();
        }
    }
    
    private async subscribeToData(): Promise<() => void> {
        return dataService.subscribe(async (data: DataType) => {
            // Update all instances when data changes
            await this.updateAllInstances(data);
        });
    }
    
    private async updateAllInstances(data: DataType): Promise<void> {
        for (const instance of this.instances.values()) {
            await this.updateDisplay(instance, data);
        }
    }
    
    private async updateDisplay(
        instance: DataInstance,
        data: DataType
    ): Promise<void> {
        const lines: string[] = [`📊 ${data.name}`, data.value.toString()];
        
        // Calculate delta using this instance's previous value
        if (instance.previousValue !== undefined) {
            const delta = data.value - instance.previousValue;
            if (delta !== 0) {
                lines.push(`${delta > 0 ? '+' : ''}${delta}`);
            }
        }
        
        instance.previousValue = data.value;
        
        await instance.action.setTitle(lines.join('\n'));
    }
    
    private async fetchData(): Promise<DataType> {
        // Implementation
        return { name: 'Data', value: 100 };
    }
}
```

## Per-Instance State Examples

### Delta Tracking

```typescript
interface WalletInstance {
    action: Action;
    previousBalance?: number; // Each button tracks its own previous value
}

private async updateDisplay(instance: WalletInstance, wallet: WalletData): Promise<void> {
    const lines: string[] = [`💰 ${wallet.balance}`];
    
    // Calculate delta using THIS instance's previous balance
    if (instance.previousBalance !== undefined) {
        const delta = wallet.balance - instance.previousBalance;
        if (delta !== 0) {
            lines.push(`${delta > 0 ? '+' : ''}${delta}`);
        }
    }
    
    // Update THIS instance's previous balance
    instance.previousBalance = wallet.balance;
    
    await instance.action.setTitle(lines.join('\n'));
}
```

### Instance-Specific Timers

```typescript
interface TimerInstance {
    action: Action;
    startTime: number;
    updateInterval?: NodeJS.Timeout;
}

override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    const instance: TimerInstance = {
        action: ev.action,
        startTime: Date.now()
    };
    
    // Each instance has its own update timer
    instance.updateInterval = setInterval(async () => {
        const elapsed = Date.now() - instance.startTime;
        await instance.action.setTitle(formatTime(elapsed));
    }, 1000);
    
    this.instances.set(ev.action.id, instance);
}
```

## Implementation Checklist

- [ ] Define `XInstance` interface with `action: Action` and optional per-instance state
- [ ] Replace single action reference with `Map<string, XInstance>`
- [ ] Add subscription tracking variables
- [ ] Update `onWillAppear`:
  - [ ] Add instance to Map with `set(ev.action.id, { action: ev.action })`
  - [ ] Wrap global subscriptions in `if (this.instances.size === 1)`
  - [ ] Wrap event listener registration in `if (this.instances.size === 1)`
  - [ ] Initialize per-instance state
- [ ] Update `onWillDisappear`:
  - [ ] Remove instance with `delete(ev.action.id)`
  - [ ] Wrap cleanup in `if (this.instances.size === 0)`
  - [ ] Clear per-instance resources (timers, etc.)
- [ ] Add `updateAllInstances()` method
- [ ] Update display methods to accept `instance` parameter instead of event
- [ ] Update event handlers to loop through all instances
- [ ] Test with multiple instances on same device
- [ ] Test with multiple devices if available

## Common Mistakes

### 1. Not Checking Instance Count

```typescript
// ❌ WRONG: Subscribes multiple times
override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    this.instances.set(ev.action.id, { action: ev.action });
    
    // This runs for EVERY instance!
    this.subscription = dataService.subscribe(/* ... */);
}

// ✅ CORRECT: Subscribe only once
override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    this.instances.set(ev.action.id, { action: ev.action });
    
    if (this.instances.size === 1) {
        this.subscription = dataService.subscribe(/* ... */);
    }
}
```

### 2. Sharing Per-Instance State

```typescript
// ❌ WRONG: All instances share the same previousValue
export class DataAction extends SingletonAction {
    private previousValue?: number; // Shared across ALL instances!
}

// ✅ CORRECT: Each instance has its own state
interface DataInstance {
    action: Action;
    previousValue?: number; // Per-instance state
}
```

### 3. Forgetting to Update All Instances

```typescript
// ❌ WRONG: Only updates first instance
private handleDataUpdate = async (data: Data): Promise<void> => {
    const firstInstance = this.instances.values().next().value;
    await firstInstance.action.setTitle(data.value);
};

// ✅ CORRECT: Updates all instances
private handleDataUpdate = async (data: Data): Promise<void> => {
    for (const instance of this.instances.values()) {
        await instance.action.setTitle(data.value);
    }
};
```

## Testing Strategy

1. **Single Instance**: Add one button, verify it works
2. **Multiple Instances**: Add 3+ buttons, verify all update independently
3. **Add/Remove**: Add and remove buttons dynamically, check for leaks
4. **Per-Instance State**: Verify each button maintains its own state
5. **Multiple Devices**: Test with multiple Stream Decks if available
6. **Resource Cleanup**: Remove all instances, verify subscriptions are cleaned up

## Performance Considerations

- **Subscription Efficiency**: Only subscribe once, broadcast to all instances
- **Batch Updates**: Update all instances together when possible
- **Memory Usage**: Clean up per-instance resources in `onWillDisappear`
- **Network Calls**: Share data fetches across all instances
- **Event Throttling**: Consider debouncing frequent updates

## Related Patterns

- **[Multi-Action Coordination](multi-action-coordination.md)**: Coordinating between different action types
- **[Polling Pattern](../code-templates/common-patterns.md#polling-pattern)**: Using Maps for interval management
- **[State Machine](../code-templates/common-patterns.md#state-machine)**: Context-based state tracking
- **[Lights Out Game](../examples/real-world-plugin-examples.md#5-lights-out-game---multi-action-coordination)**: Example using state coordination

---

**See Also**:
- [Action Development](../core-concepts/action-development.md)
- [Common Patterns](../code-templates/common-patterns.md)
- [Real-World Examples](../examples/real-world-plugin-examples.md)
