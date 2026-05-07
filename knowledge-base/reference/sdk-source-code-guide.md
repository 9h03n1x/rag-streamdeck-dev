---
category: reference
title: SDK Source Code Guide
tags: [sdk, source-code, repository, internal-structure, navigation]
difficulty: intermediate-advanced
sdk-version: v2
related-files: [architecture-overview.md, api-reference.md, environment-setup.md]
description: Guide to navigating and understanding the official Stream Deck SDK source code structure for advanced development and contribution
---

# SDK Source Code Guide

## Overview

This guide helps you navigate the official [elgatosf/streamdeck](https://github.com/elgatosf/streamdeck) repository to understand SDK internals, contribute to the SDK, or build advanced plugins that leverage deep SDK knowledge. It reflects the SDK 2.1.0 monorepo layout at commit `f69a86cafdd0b0a7b98f80eca49bab8c41112a45`.

## When You Need This Guide

- Contributing to the SDK itself
- Understanding SDK internals for advanced plugin development  
- Debugging SDK-level issues
- Building tools that extend the SDK
- Learning advanced patterns from SDK source code

## Repository Structure

### 📁 Root Directory

```
streamdeck/
├── packages/
│   └── plugin/             # @elgato/streamdeck package
│       ├── src/            # Main SDK source code
│       ├── tests/          # Vitest tests and utilities
│       └── package.json    # Published package metadata
├── .github/workflows/      # CI/CD automation
├── .vscode/                # VS Code settings
├── assets/                 # Documentation media
├── package.json            # Workspace scripts
├── tsconfig.json           # TypeScript configuration
├── README.md               # Main documentation
└── pnpm-workspace.yaml     # Workspace package layout
```

### 📦 Source Code Architecture (`packages/plugin/src/`)

The SDK is organized into four main layers:

#### `packages/plugin/src/api/` - Low-Level API Layer 🔌

**Purpose**: Defines the raw communication protocol between plugins and Stream Deck

```typescript
// Example: Understanding raw events
import type { KeyDown, DialRotate } from "@elgato/streamdeck/api";

// These types are defined in packages/plugin/src/api/events/
```

**Key Directories:**
- `events/` - Event definitions (KeyDown, DialRotate, TouchTap, etc.)
- `registration/` - Plugin registration and manifest types
- `__mocks__/` - API testing mocks

**Key Files:**
- `command.ts` - Commands for Stream Deck communication
- `device.ts` - Device types and capabilities
- `i18n.ts` - Internationalization type definitions
- `layout.ts` - Layout and feedback system types
- `target.ts` - Event target definitions

**When to Reference:**
- Building tools that work with raw Stream Deck events
- Understanding the protocol specification
- Contributing event handlers or new event types
- Debugging low-level communication issues

#### `@elgato/utils` - Shared Utilities 🛠️

**Purpose**: Utility functions and types used by the plugin package. In the current monorepo-era SDK, many shared primitives come from the separate `@elgato/utils` package.

```typescript
// Example: Using common utilities
import type { JsonObject } from "@elgato/utils";
```

**What You'll Find:**
- Type utilities and helpers
- Cross-cutting functionality 
- Shared constants and enums
- Common validation logic

**When to Reference:**
- Understanding SDK utility patterns
- Building SDK extensions
- Contributing shared functionality

#### `packages/plugin/src/plugin/` - Plugin Development Framework 🎯

**Purpose**: High-level abstractions that make plugin development easier

This is the main layer plugin developers interact with:

##### `packages/plugin/src/plugin/actions/` - Action System

```typescript
// The SingletonAction you use is defined here
import { SingletonAction } from "@elgato/streamdeck";

// Source location: packages/plugin/src/plugin/actions/singleton-action.ts
```

**Files:**
- `singleton-action.ts` - Base action class implementation
- `action.ts` - Core action functionality
- `context.ts` - Action context management
- `dial.ts` - Dial-specific action features
- `key.ts` - Key-specific action features
- `service.ts` - Action service and management
- `store.ts` - Action storage and retrieval

##### `packages/plugin/src/plugin/events/` - Event System

```typescript
// Event types you use in handlers
import type { KeyDownEvent, DialRotateEvent } from "@elgato/streamdeck";

// Source location: packages/plugin/src/plugin/events/index.ts
```

**What's Here:**
- High-level event wrappers
- Event type definitions
- Event transformation logic

##### `packages/plugin/src/plugin/devices/` - Device Management

```typescript  
// Device information you access
import { streamDeck } from "@elgato/streamdeck";
const devices = streamDeck.devices;

// Source location: packages/plugin/src/plugin/devices/service.ts
```

**Files:**
- `device.ts` - Device information and capabilities
- `service.ts` - Device management service
- `store.ts` - Device storage and lookup

##### Other Key Plugin Files

```typescript
// Main SDK entry point
// Source: packages/plugin/src/plugin/index.ts
import streamDeck from "@elgato/streamdeck";

// Settings management
// Source: packages/plugin/src/plugin/settings.ts
await streamDeck.settings.setGlobalSettings(data);

// Internationalization  
// Source: packages/plugin/src/plugin/i18n.ts
const text = streamDeck.i18n.translate("key");

// WebSocket communication
// Source: packages/plugin/src/plugin/connection.ts
// (Internal - handles communication with Stream Deck app)
```

**Key Files:**
- `index.ts` ⭐ - **Main entry point** (start here!)
- `connection.ts` - WebSocket connection management
- `manifest.ts` - Manifest loading and validation
- `settings.ts` - Settings persistence
- `i18n.ts` - Internationalization implementation
- `ui.ts` - Property Inspector communication
- `system.ts` - System information
- `profiles.ts` - Profile management
- `logging/` - Logging infrastructure

## Development Task → Source Location Mapping

### 🎯 Common Development Tasks

| Task | Primary Location | Supporting Files |
|------|-----------------|------------------|
| **Creating Actions** | `packages/plugin/src/plugin/actions/singleton-action.ts` | `packages/plugin/src/plugin/index.ts` |
| **Event Handling** | `packages/plugin/src/plugin/events/index.ts` | `packages/plugin/src/api/events/` |
| **Settings Management** | `packages/plugin/src/plugin/settings.ts` | `packages/plugin/src/plugin/ui.ts` |
| **Device Detection** | `packages/plugin/src/plugin/devices/service.ts` | `packages/plugin/src/api/device.ts` |
| **Internationalization** | `packages/plugin/src/plugin/i18n.ts` | `packages/plugin/src/api/i18n.ts` |
| **WebSocket Communication** | `packages/plugin/src/plugin/connection.ts` | `packages/plugin/src/api/command.ts` |
| **Manifest Handling** | `packages/plugin/src/plugin/manifest.ts` | `packages/plugin/src/api/registration/` |
| **Logging** | `packages/plugin/src/plugin/logging/` | - |
| **Property Inspector** | `packages/plugin/src/plugin/ui.ts` | `packages/plugin/src/api/layout.ts` |

### 🔍 Finding Specific Features

#### Action-Related Code
**Question**: "How does `onKeyDown` work internally?"
**Location**: `packages/plugin/src/plugin/actions/singleton-action.ts`

```typescript
// In SingletonAction class, you'll find:
public onKeyDown?(ev: KeyDownEvent<T>): Promise<void> | void;
```

#### Event Processing
**Question**: "How are raw events transformed into typed events?"
**Location**: `packages/plugin/src/plugin/events/index.ts`

```typescript
// Event transformation from raw API to typed events
export type KeyDownEvent<T> = ActionEvent<KeyDown<T>, KeyAction<T>>;
```

#### Settings Persistence 
**Question**: "How does `setSettings()` work internally?"
**Location**: `packages/plugin/src/plugin/settings.ts`

```typescript
// Settings implementation details
export async function setGlobalSettings<T extends JsonObject>(settings: T): Promise<void>
```

#### Device Capabilities
**Question**: "How does device detection work?"
**Location**: `packages/plugin/src/plugin/devices/device.ts`

```typescript  
// Device information and capabilities
export class Device {
  get type(): DeviceType { /* ... */ }
  get size(): Size { /* ... */ }
}
```

## Learning Path Through Source Code

### 🎓 Beginner Level
1. **Start**: `packages/plugin/src/plugin/index.ts` - See what's exported
2. **Actions**: `packages/plugin/src/plugin/actions/singleton-action.ts` - Understand base class
3. **Events**: `packages/plugin/src/plugin/events/index.ts` - See available events
4. **Example Usage**: Look at test files under `packages/plugin/src` and the package's Vitest setup

### 🏗️ Intermediate Level
1. **Settings**: `packages/plugin/src/plugin/settings.ts` - Settings implementation
2. **Devices**: `packages/plugin/src/plugin/devices/` - Device management
3. **UI**: `packages/plugin/src/plugin/ui.ts` - Property Inspector communication
4. **I18n**: `packages/plugin/src/plugin/i18n.ts` - Localization system

### 🚀 Advanced Level
1. **Connection**: `packages/plugin/src/plugin/connection.ts` - WebSocket layer
2. **API Layer**: `packages/plugin/src/api/` - Protocol definitions
3. **Utilities**: `@elgato/utils` and local plugin helpers
4. **Contributing**: Understand Vitest patterns in the plugin package

## Debugging with Source Knowledge

### Understanding Error Messages

When you see SDK errors, you can trace them to source:

```bash
Error: Failed to initialize action; device device123 not found

# This error comes from:
# packages/plugin/src/plugin/actions/context.ts
# In ActionContext constructor
```

### Finding Implementation Details

```typescript
// If you're wondering how streamDeck.actions works:
// 1. Look at packages/plugin/src/plugin/index.ts for the export
// 2. Follow to packages/plugin/src/plugin/actions/service.ts for implementation
// 3. Check packages/plugin/src/plugin/actions/store.ts for storage

const actions = streamDeck.actions; // Defined in index.ts
```

### Performance Investigation

```typescript
// To understand performance characteristics:
// 1. Check packages/plugin/src/plugin/connection.ts for message handling
// 2. Look at packages/plugin/src/plugin/actions/store.ts for action lookup
// 3. Review packages/plugin/src/plugin/events/ for event processing overhead
```

## Contributing to the SDK

### 1. Understanding the Build System

**Build Configuration**: `packages/plugin/tsconfig.build.json`
```javascript
// The SDK package builds with TypeScript: tsc -p tsconfig.build.json
```

**Testing**: `packages/plugin` Vitest scripts
```javascript  
// Unit tests use Vitest
// package script: npm test / pnpm test from the workspace package
```

### 2. Code Style and Standards

**Linting**: `eslint.config.mjs`
```javascript
// ESLint rules for code style
// Follow existing patterns in packages/plugin/src/
```

**Editor Config**: `.editorconfig`
```
# Consistent code formatting
# Tabs vs spaces, line endings, etc.
```

### 3. Contribution Areas

#### Adding New Event Types
1. **API Definition**: Add to `packages/plugin/src/api/events/`
2. **Plugin Wrapper**: Add to `packages/plugin/src/plugin/events/`
3. **Action Handler**: Update `packages/plugin/src/plugin/actions/singleton-action.ts`
4. **Tests**: Add or update Vitest coverage in the plugin package

#### Adding New Device Support
1. **Device Types**: Update `packages/plugin/src/api/device.ts`
2. **Device Management**: Update `packages/plugin/src/plugin/devices/`
3. **Device Detection**: Update device service logic

#### Improving Performance
1. **Connection Layer**: `packages/plugin/src/plugin/connection.ts`
2. **Event Processing**: `packages/plugin/src/plugin/events/`
3. **Action Management**: `packages/plugin/src/plugin/actions/store.ts`

## Best Practices for Source Code Usage

### 1. **Import from Public APIs**

```typescript
// ✅ Good - Use public exports
import { streamDeck, SingletonAction } from "@elgato/streamdeck";

// ❌ Avoid - Don't import internal modules
import { connection } from "@elgato/streamdeck/plugin/connection";
```

### 2. **Understanding vs Using**

- **Use source for understanding** - Learn patterns and architecture
- **Don't copy internal code** - Use public APIs instead
- **Contribute improvements** - Submit PRs for enhancements

### 3. **Keeping Up with Changes**

```typescript
// Follow CHANGELOG.md for API changes
// Check UPGRADE.md for migration guides
// Monitor GitHub releases for new features
```

## Common Source Code Patterns

### 1. **Event System Pattern**

```typescript
// Pattern found throughout packages/plugin/src/plugin/events/
export type EventType<TPayload> = ActionEvent<APIEvent<TPayload>, ActionInstance>;

// This pattern transforms raw API events into typed, contextualized events
```

### 2. **Service Pattern**

```typescript
// Pattern in packages/plugin/src/plugin/*/service.ts files
class Service extends ReadOnlyStore {
  constructor() {
    super();
    // Setup event listeners
  }
  
  public onEvent<T>(listener: (ev: Event<T>) => void): IDisposable {
    // Event registration pattern
  }
}
```

### 3. **Store Pattern**

```typescript
// Pattern in packages/plugin/src/plugin/*/store.ts files
class Store extends Enumerable<Item> {
  private items = new Map<string, Item>();
  
  public set(item: Item): void { /* ... */ }
  public get(id: string): Item | undefined { /* ... */ }
}
```

## Additional Resources

### Official Links
- **Repository**: https://github.com/elgatosf/streamdeck
- **Package**: https://www.npmjs.com/package/@elgato/streamdeck
- **Documentation**: https://docs.elgato.com/sdk

### Community
- **Discord**: https://discord.gg/GehBUcu627
- **Issues**: https://github.com/elgatosf/streamdeck/issues

---

## Summary

Understanding the SDK source code structure helps you:

1. **Debug Issues**: Trace problems to their source
2. **Learn Patterns**: Understand how the SDK is architected  
3. **Contribute**: Add features or fix bugs in the SDK
4. **Build Tools**: Create SDK extensions or development tools
5. **Optimize Performance**: Understand performance characteristics

**Remember**: Use this knowledge to understand and contribute, but always use the public APIs in your plugins rather than importing internal modules directly.