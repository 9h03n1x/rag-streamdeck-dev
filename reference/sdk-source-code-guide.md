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

This guide helps you navigate the official [elgatosf/streamdeck](https://github.com/elgatosf/streamdeck) repository to understand SDK internals, contribute to the SDK, or build advanced plugins that leverage deep SDK knowledge.

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
├── src/                    # Main SDK source code
├── tests/                  # Test files and utilities  
├── .github/workflows/      # CI/CD automation
├── .vscode/                # VS Code settings
├── assets/                 # Documentation media
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── rollup.config.mjs      # Build configuration
├── jest.config.js         # Test configuration
├── README.md              # Main documentation
├── CHANGELOG.md           # Version history
└── UPGRADE.md             # Migration guides
```

### 📦 Source Code Architecture (`src/`)

The SDK is organized into four main layers:

#### `src/api/` - Low-Level API Layer 🔌

**Purpose**: Defines the raw communication protocol between plugins and Stream Deck

```typescript
// Example: Understanding raw events
import type { KeyDown, DialRotate } from "@elgato/streamdeck/api";

// These types are defined in src/api/events/
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

#### `src/common/` - Shared Utilities 🛠️

**Purpose**: Utility functions and types used across both API and Plugin layers

```typescript
// Example: Using common utilities
import { JsonObject } from "@elgato/streamdeck/common";
import { Enumerable } from "@elgato/streamdeck/common";
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

#### `src/plugin/` - Plugin Development Framework 🎯

**Purpose**: High-level abstractions that make plugin development easier

This is the main layer plugin developers interact with:

##### `src/plugin/actions/` - Action System

```typescript
// The SingletonAction you use is defined here
import { SingletonAction } from "@elgato/streamdeck";

// Source location: src/plugin/actions/singleton-action.ts
```

**Files:**
- `singleton-action.ts` - Base action class implementation
- `action.ts` - Core action functionality
- `context.ts` - Action context management
- `dial.ts` - Dial-specific action features
- `key.ts` - Key-specific action features
- `service.ts` - Action service and management
- `store.ts` - Action storage and retrieval

##### `src/plugin/events/` - Event System

```typescript
// Event types you use in handlers
import type { KeyDownEvent, DialRotateEvent } from "@elgato/streamdeck";

// Source location: src/plugin/events/index.ts
```

**What's Here:**
- High-level event wrappers
- Event type definitions
- Event transformation logic

##### `src/plugin/devices/` - Device Management

```typescript  
// Device information you access
import { streamDeck } from "@elgato/streamdeck";
const devices = streamDeck.devices;

// Source location: src/plugin/devices/service.ts
```

**Files:**
- `device.ts` - Device information and capabilities
- `service.ts` - Device management service
- `store.ts` - Device storage and lookup

##### Other Key Plugin Files

```typescript
// Main SDK entry point
// Source: src/plugin/index.ts
import streamDeck from "@elgato/streamdeck";

// Settings management
// Source: src/plugin/settings.ts
await streamDeck.settings.setGlobalSettings(data);

// Internationalization  
// Source: src/plugin/i18n.ts
const text = streamDeck.i18n.translate("key");

// WebSocket communication
// Source: src/plugin/connection.ts
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
| **Creating Actions** | `src/plugin/actions/singleton-action.ts` | `src/plugin/index.ts` |
| **Event Handling** | `src/plugin/events/index.ts` | `src/api/events/` |
| **Settings Management** | `src/plugin/settings.ts` | `src/plugin/ui.ts` |
| **Device Detection** | `src/plugin/devices/service.ts` | `src/api/device.ts` |
| **Internationalization** | `src/plugin/i18n.ts` | `src/api/i18n.ts` |
| **WebSocket Communication** | `src/plugin/connection.ts` | `src/api/command.ts` |
| **Manifest Handling** | `src/plugin/manifest.ts` | `src/api/registration/` |
| **Logging** | `src/plugin/logging/` | - |
| **Property Inspector** | `src/plugin/ui.ts` | `src/api/layout.ts` |

### 🔍 Finding Specific Features

#### Action-Related Code
**Question**: "How does `onKeyDown` work internally?"
**Location**: `src/plugin/actions/singleton-action.ts`

```typescript
// In SingletonAction class, you'll find:
public onKeyDown?(ev: KeyDownEvent<T>): Promise<void> | void;
```

#### Event Processing
**Question**: "How are raw events transformed into typed events?"
**Location**: `src/plugin/events/index.ts`

```typescript
// Event transformation from raw API to typed events
export type KeyDownEvent<T> = ActionEvent<KeyDown<T>, KeyAction<T>>;
```

#### Settings Persistence 
**Question**: "How does `setSettings()` work internally?"
**Location**: `src/plugin/settings.ts`

```typescript
// Settings implementation details
export async function setGlobalSettings<T extends JsonObject>(settings: T): Promise<void>
```

#### Device Capabilities
**Question**: "How does device detection work?"
**Location**: `src/plugin/devices/device.ts`

```typescript  
// Device information and capabilities
export class Device {
  get type(): DeviceType { /* ... */ }
  get size(): Size { /* ... */ }
}
```

## Learning Path Through Source Code

### 🎓 Beginner Level
1. **Start**: `src/plugin/index.ts` - See what's exported
2. **Actions**: `src/plugin/actions/singleton-action.ts` - Understand base class
3. **Events**: `src/plugin/events/index.ts` - See available events
4. **Example Usage**: Look at test files in `__tests__/`

### 🏗️ Intermediate Level
1. **Settings**: `src/plugin/settings.ts` - Settings implementation
2. **Devices**: `src/plugin/devices/` - Device management
3. **UI**: `src/plugin/ui.ts` - Property Inspector communication
4. **I18n**: `src/plugin/i18n.ts` - Localization system

### 🚀 Advanced Level
1. **Connection**: `src/plugin/connection.ts` - WebSocket layer
2. **API Layer**: `src/api/` - Protocol definitions
3. **Common**: `src/common/` - Utility patterns
4. **Contributing**: Understand test patterns in `__tests__/`

## Debugging with Source Knowledge

### Understanding Error Messages

When you see SDK errors, you can trace them to source:

```bash
Error: Failed to initialize action; device device123 not found

# This error comes from:
# src/plugin/actions/context.ts
# In ActionContext constructor
```

### Finding Implementation Details

```typescript
// If you're wondering how streamDeck.actions works:
// 1. Look at src/plugin/index.ts for the export
// 2. Follow to src/plugin/actions/service.ts for implementation
// 3. Check src/plugin/actions/store.ts for storage

const actions = streamDeck.actions; // Defined in index.ts
```

### Performance Investigation

```typescript
// To understand performance characteristics:
// 1. Check src/plugin/connection.ts for message handling
// 2. Look at src/plugin/actions/store.ts for action lookup
// 3. Review src/plugin/events/ for event processing overhead
```

## Contributing to the SDK

### 1. Understanding the Build System

**Build Configuration**: `rollup.config.mjs`
```javascript
// The SDK uses Rollup for building
// TypeScript compilation settings in tsconfig.json
```

**Testing**: `jest.config.js`
```javascript  
// Unit tests use Jest
// Test files in __tests__ directories
```

### 2. Code Style and Standards

**Linting**: `eslint.config.mjs`
```javascript
// ESLint rules for code style
// Follow existing patterns in src/
```

**Editor Config**: `.editorconfig`
```
# Consistent code formatting
# Tabs vs spaces, line endings, etc.
```

### 3. Contribution Areas

#### Adding New Event Types
1. **API Definition**: Add to `src/api/events/`
2. **Plugin Wrapper**: Add to `src/plugin/events/`  
3. **Action Handler**: Update `src/plugin/actions/singleton-action.ts`
4. **Tests**: Add to appropriate `__tests__/` directory

#### Adding New Device Support
1. **Device Types**: Update `src/api/device.ts`
2. **Device Management**: Update `src/plugin/devices/`
3. **Device Detection**: Update device service logic

#### Improving Performance
1. **Connection Layer**: `src/plugin/connection.ts`
2. **Event Processing**: `src/plugin/events/`
3. **Action Management**: `src/plugin/actions/store.ts`

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
// Pattern found throughout src/plugin/events/
export type EventType<TPayload> = ActionEvent<APIEvent<TPayload>, ActionInstance>;

// This pattern transforms raw API events into typed, contextualized events
```

### 2. **Service Pattern**

```typescript
// Pattern in src/plugin/*/service.ts files
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
// Pattern in src/plugin/*/store.ts files
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