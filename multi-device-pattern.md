# Multi-Device Pattern for Stream Deck Actions

## Overview

The multi-device pattern enables Stream Deck actions to support multiple instances across different devices or multiple buttons on the same device. Without this pattern, all instances of an action share the same state and display, which causes incorrect behavior when users have multiple Stream Decks or multiple instances of the same action.

## Why This Pattern Is Needed

### Problem Without Multi-Device Pattern
- **Shared State**: All button instances share the same `currentAction` reference
- **Incorrect Updates**: Updating one button affects all instances incorrectly
- **Resource Leaks**: Event listeners and subscriptions registered multiple times
- **Lost State**: Per-button state (like Wallet's previous balance) shared across all instances

### Solution With Multi-Device Pattern
- **Independent Instances**: Each button tracks its own state
- **Correct Updates**: All instances update independently with their own data
- **Proper Cleanup**: Event listeners and subscriptions managed efficiently
- **Instance State**: Each button can maintain unique state (e.g., delta calculations)

## Pattern Implementation

### 1. Define Instance Interface

Create an interface to represent each button instance. Include the action reference and any per-instance state.

```typescript
interface WalletInstance {
    action: any;
    previousBalance?: number; // Optional per-instance state
}
```

### 2. Replace Single Action with Map

Replace the single `currentAction` reference with a `Map` that tracks all instances by their unique ID.

**Before:**
```typescript
private currentAction?: any;
```

**After:**
```typescript
private actionInstances: Map<string, WalletInstance> = new Map();
private unsubscribeGlobal?: () => void; // For global data updates
```

### 3. Update onWillAppear

Add new instances to the Map when they appear. Register event listeners and subscriptions **only on the first instance**.

```typescript
override async onWillAppear(ev: WillAppearEvent<WalletSettings>): Promise<void> {
    // Add instance to Map
    this.actionInstances.set(ev.action.id, { 
        action: ev.action,
        previousBalance: undefined // Initialize per-instance state
    });

    // Register event listeners ONLY on first instance
    if (this.actionInstances.size === 1) {
        pluginEvents.on(EVENTS.LOGIN_SUCCESS, this.handleLoginSuccess);
        pluginEvents.on(EVENTS.LOGOUT, this.handleLogout);
    }

    // Get authentication and character info...
    const character = await authService.getCharacterInfo();
    if (!character) {
        await ev.action.setTitle(buildButtonTitle(["❌ Error", "No character"]));
        return;
    }

    this.characterId = character.id;
    this.characterName = character.name;

    // Subscribe to data ONLY on first instance
    if (this.actionInstances.size === 1) {
        this.unsubscribe = dataService.subscribe(
            "wallet",
            this.characterId,
            async (data: Wallet) => {
                await this.updateAllInstances(data);
            }
        );

        // Subscribe to global data updates
        this.unsubscribeGlobal = dataService.onDataUpdate(
            "wallet", 
            this.characterId, 
            (data: Wallet) => {
                this.updateAllInstances(data).catch(console.error);
            }
        );
    }

    // Initial display
    await this.updateDisplay(ev.action, null);
}
```

### 4. Update onWillDisappear

Remove instances from the Map when they disappear. Unregister event listeners and subscriptions **only when the last instance is removed**.

```typescript
override async onWillDisappear(ev: WillDisappearEvent<WalletSettings>): Promise<void> {
    // Remove instance from Map
    this.actionInstances.delete(ev.action.id);

    // Cleanup ONLY when last instance is removed
    if (this.actionInstances.size === 0) {
        // Unregister event listeners
        pluginEvents.off(EVENTS.LOGIN_SUCCESS, this.handleLoginSuccess);
        pluginEvents.off(EVENTS.LOGOUT, this.handleLogout);

        // Unsubscribe from data service
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }

        if (this.unsubscribeGlobal) {
            this.unsubscribeGlobal();
            this.unsubscribeGlobal = undefined;
        }

        // Clear character info
        this.characterId = undefined;
        this.characterName = undefined;
    }

    streamDeck.logger.info(`[Wallet] Action disappeared`);
}
```

### 5. Add updateAllInstances Method

Create a method to update all instances when data changes.

```typescript
/**
 * Update all instances with the same data
 */
private async updateAllInstances(wallet: Wallet): Promise<void> {
    for (const instance of this.actionInstances.values()) {
        await this.updateDisplay(instance, wallet);
    }
}
```

### 6. Refactor updateDisplay Signature

Change the display update method to accept an instance or action reference instead of the full event.

**Before:**
```typescript
private async updateDisplay(ev: WillAppearEvent<WalletSettings>, wallet: Wallet): Promise<void> {
    // ...
    await ev.action.setTitle(buildButtonTitle(lines));
}
```

**After:**
```typescript
private async updateDisplay(instance: WalletInstance, wallet: Wallet): Promise<void> {
    // ...
    await instance.action.setTitle(buildButtonTitle(lines));
}
```

### 7. Update Event Handlers

Refactor `handleLoginSuccess` and `handleLogout` to loop through all instances.

```typescript
private handleLoginSuccess = async (): Promise<void> => {
    if (this.actionInstances.size === 0) {
        return;
    }

    streamDeck.logger.info(`[Wallet] Handling login success - reinitializing`);

    // Show loading state on ALL instances
    for (const instance of this.actionInstances.values()) {
        await instance.action.setTitle(buildButtonTitle(["💰 Wallet", "Loading..."]))
            .catch((err: Error) => streamDeck.logger.error(`Failed to set loading title: ${err.message}`));
    }

    // Unsubscribe from old subscriptions
    if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = undefined;
    }

    if (this.unsubscribeGlobal) {
        this.unsubscribeGlobal();
        this.unsubscribeGlobal = undefined;
    }

    // Get new character info
    const character = await authService.getCharacterInfo();
    if (!character) {
        for (const instance of this.actionInstances.values()) {
            await instance.action.setTitle(buildButtonTitle(["❌ Error", "No character"]))
                .catch((err: Error) => streamDeck.logger.error(`Failed to set error title: ${err.message}`));
        }
        return;
    }

    this.characterId = character.id;
    this.characterName = character.name;

    // Re-subscribe to data
    this.unsubscribe = dataService.subscribe(
        "wallet",
        this.characterId,
        async (data: Wallet) => {
            await this.updateAllInstances(data);
        }
    );

    this.unsubscribeGlobal = dataService.onDataUpdate(
        "wallet",
        this.characterId,
        (data: Wallet) => {
            this.updateAllInstances(data).catch(console.error);
        }
    );

    streamDeck.logger.info(`[Wallet] Reinitialized for character ${this.characterName}`);
};

private handleLogout = async (): Promise<void> => {
    if (this.actionInstances.size === 0) {
        return;
    }

    streamDeck.logger.info(`[Wallet] Handling logout - resetting to locked state`);

    // Unsubscribe from data service
    if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = undefined;
    }

    if (this.unsubscribeGlobal) {
        this.unsubscribeGlobal();
        this.unsubscribeGlobal = undefined;
    }

    // Clear character info
    this.characterId = undefined;
    this.characterName = undefined;

    // Show locked state on ALL instances
    for (const instance of this.actionInstances.values()) {
        await instance.action.setTitle(buildButtonTitle(["🔒 Locked", "Login req"]))
            .catch((err: Error) => streamDeck.logger.error(`Failed to set locked title: ${err.message}`));
    }

    streamDeck.logger.info(`[Wallet] Reset to locked state after logout`);
};
```

## Per-Instance State Example

For actions that need per-instance state (like Wallet's delta tracking), store the state in the instance object.

### Wallet Delta Tracking

```typescript
interface WalletInstance {
    action: any;
    previousBalance?: number; // Each instance tracks its own previous balance
}

private async updateDisplay(instance: WalletInstance, wallet: Wallet): Promise<void> {
    const lines: string[] = [];
    
    lines.push(`💰 ${formatISK(wallet.balance)}`);

    // Calculate delta using THIS instance's previous balance
    if (instance.previousBalance !== undefined) {
        const delta = wallet.balance - instance.previousBalance;
        if (delta !== 0) {
            const sign = delta > 0 ? "+" : "";
            lines.push(`${sign}${formatISK(delta)}`);
        }
    }

    // Update THIS instance's previous balance
    instance.previousBalance = wallet.balance;

    await instance.action.setTitle(buildButtonTitle(lines))
        .catch((err: Error) => streamDeck.logger.error(`Failed to set title: ${err.message}`));
}
```

## Checklist for Implementation

Use this checklist when implementing the multi-device pattern for a new action:

- [ ] Define `XInstance` interface with `action: any` and optional per-instance state
- [ ] Add `private actionInstances: Map<string, XInstance> = new Map();`
- [ ] Add `private unsubscribeGlobal?: () => void;`
- [ ] Update `onWillAppear`:
  - [ ] Replace `this.currentAction = ev.action` with `this.actionInstances.set(ev.action.id, { action: ev.action })`
  - [ ] Wrap event listener registration in `if (this.actionInstances.size === 1)`
  - [ ] Wrap data subscription in `if (this.actionInstances.size === 1)`
  - [ ] Add `dataService.onDataUpdate()` subscription
  - [ ] Update initial display call to use action instead of event
- [ ] Update `onWillDisappear`:
  - [ ] Replace `this.currentAction = undefined` with `this.actionInstances.delete(ev.action.id)`
  - [ ] Wrap cleanup in `if (this.actionInstances.size === 0)`
  - [ ] Add `unsubscribeGlobal` cleanup
- [ ] Add `updateAllInstances(data)` method that loops through Map
- [ ] Update `updateDisplay` signature from `(ev, data)` to `(instance/action, data)`
- [ ] Update `handleLoginSuccess` to loop through all instances
- [ ] Update `handleLogout` to loop through all instances
- [ ] Remove all references to `this.currentAction`

## Common Mistakes to Avoid

1. **Forgetting to check `actionInstances.size`**: Always wrap event listener registration/cleanup in size checks
2. **Missing `unsubscribeGlobal`**: Don't forget to subscribe to global data updates and clean them up
3. **Wrong updateDisplay signature**: Must accept instance/action, not the full event object
4. **Shared per-instance state**: Store state in the instance object, not as class properties
5. **Not looping through instances**: Both login and logout handlers must update ALL instances

## Testing

After implementing the pattern, test with:

1. **Single instance**: Add one button, verify it works correctly
2. **Multiple instances on same device**: Add multiple buttons of the same action, verify they all update
3. **Multiple devices**: If available, test with multiple Stream Decks connected
4. **Per-instance state**: For actions like Wallet, verify each button tracks its own delta independently
5. **Login/Logout**: Verify all instances update correctly when logging in/out
6. **Add/Remove instances**: Add and remove buttons while others remain, verify no crashes or stale data

## Actions Using This Pattern

The following actions have been refactored to use the multi-device pattern:

- ✅ Wallet (with per-instance `previousBalance`)
- ✅ Ship
- ✅ Skill Queue
- ✅ Mail
- ✅ Industry Jobs
- ✅ Market Orders
- ✅ Killboard
- ✅ Location
- ✅ Fleet
- ✅ Corporation
- ✅ Contracts
- ✅ Jump Clones
- ✅ Planetary Interaction
- ✅ Research Agents

## Benefits

- **Scalability**: Supports unlimited instances across unlimited devices
- **Performance**: Event listeners and subscriptions only registered once
- **Correctness**: Each button displays accurate, independent data
- **Maintainability**: Clear separation of instance state from class state
- **User Experience**: Users can create complex multi-device setups without issues
