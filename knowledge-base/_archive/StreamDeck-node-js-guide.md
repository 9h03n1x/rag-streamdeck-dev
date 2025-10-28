# Stream Deck Node.js SDK - Repository Navigation Guide

## Repository Information
- **Repository**: [elgatosf/streamdeck](https://github.com/elgatosf/streamdeck)
- **Package**: `@elgato/streamdeck`
- **License**: MIT
- **Documentation**: https://docs.elgato.com/sdk

## Overview
The official Elgato Stream Deck SDK for Node.js enables plugin development for Stream Deck devices. This guide helps you navigate the repository structure to find what you need.

---

## 📂 Root Directory Structure

### Configuration Files
- **package.json** - Project dependencies and scripts
- **package-lock.json** - Locked dependency versions
- **tsconfig.json** - TypeScript compiler configuration
- **tsconfig.build.json** - Build-specific TypeScript configuration
- **rollup.config.mjs** - Rollup bundler configuration
- **eslint.config.mjs** - ESLint linting configuration
- **jest.config.js** - Jest testing framework configuration
- **.editorconfig** - Code editor configuration
- **.gitignore** - Git ignore patterns
- **.npmrc** - npm configuration

### Documentation Files
- **README.md** - Main repository documentation and quick start guide
- **CHANGELOG.md** - Version history and release notes
- **UPGRADE.md** - Migration guides for version upgrades
- **LICENSE** - MIT license terms

### Directories

#### `.github/workflows/`
Contains GitHub Actions CI/CD workflows for automated testing and deployment.

#### `.vscode/`
Visual Studio Code workspace settings and configurations for development.

#### `assets/`
Repository assets including images, GIFs, and other media files used in documentation.

#### `src/` ⭐
**Main source code directory** - Contains all SDK implementation code.

#### `tests/`
Test files and test utilities for the SDK.

---

## 📦 Source Code Structure (`src/`)

The `src/` directory is organized into four main areas:

### `src/__mocks__/`
Mock implementations for testing purposes. Contains test doubles and stubs for SDK components.

---

### `src/api/` 🔌
**Stream Deck API definitions and types**

This directory defines the low-level API that plugins use to communicate with the Stream Deck application.

#### Subdirectories
- **`events/`** - Event definitions and interfaces for Stream Deck events
- **`registration/`** - Plugin registration and manifest-related types
- **`__mocks__/`** - Mock implementations for API testing

#### Key Files
- **`command.ts`** - Command definitions for Stream Deck communication
- **`device.ts`** - Device types and interfaces (Stream Deck models, sizes, etc.)
- **`i18n.ts`** - Internationalization and localization types
- **`index.ts`** - Main API exports
- **`layout.ts`** - Layout and UI arrangement types
- **`target.ts`** - Target definitions for actions and events

**Use this directory when**: You need to understand the underlying API structure, work with raw events, or extend the SDK with custom functionality.

---

### `src/common/`
**Shared utilities and helper functions**

Contains common code used across both API and plugin layers. Look here for utility functions, shared types, and cross-cutting concerns.

**Use this directory when**: You need shared utilities, common types, or helper functions that work across different SDK components.

---

### `src/plugin/` 🎯
**High-level plugin development framework**

This is the main directory for plugin developers. It provides a developer-friendly abstraction over the raw API.

#### Subdirectories
- **`actions/`** - Action class implementations and decorators
  - Contains the `SingletonAction` base class
  - Action lifecycle management
  - Action event handlers

- **`common/`** - Plugin-specific common utilities
  - Helper functions for plugin development
  - Shared plugin utilities

- **`devices/`** - Device management and device-specific functionality
  - Device detection
  - Device capabilities
  - Device event handling

- **`events/`** - High-level event abstractions
  - KeyDown, KeyUp, WillAppear, WillDisappear events
  - Dial events (rotation, press, touch)
  - Touchscreen events
  - Property Inspector events

- **`logging/`** - Logging infrastructure
  - Logger configuration
  - Log levels
  - SDK compatibility checking

- **`__mocks__/`** - Plugin testing mocks
- **`__tests__/`** - Plugin unit tests

#### Key Files
- **`index.ts`** - Main plugin exports (start here!)
  - Primary entry point for plugin developers
  - Exports all public APIs

- **`connection.ts`** - WebSocket connection management
  - Handles communication with Stream Deck app
  - Connection lifecycle

- **`manifest.ts`** - Manifest loading and validation
  - Reads and validates plugin manifest.json
  - Manifest schema definitions

- **`profiles.ts`** - Profile management
  - Profile switching
  - Profile-related events

- **`settings.ts`** - Settings management
  - Global settings
  - Action-specific settings
  - Settings persistence

- **`system.ts`** - System information
  - Platform detection
  - System capabilities

- **`ui.ts`** - User interface utilities
  - Property Inspector communication
  - UI state management

- **`i18n.ts`** - Plugin internationalization
  - Localized string loading
  - Language detection

- **`validation.ts`** - Input validation utilities
  - Settings validation
  - Type checking helpers

**Use this directory when**: You're building a plugin and need to work with actions, events, settings, or any plugin functionality.

---

## 🎯 Common Development Tasks

### Finding Action-Related Code
**Location**: `src/plugin/actions/`
- Base action classes
- Action decorators (`@action`)
- Action lifecycle methods

### Finding Event Handlers
**Location**: `src/plugin/events/`
- Look here for event interfaces
- Event types (KeyDown, DialRotate, etc.)
- Event data structures

### Finding Device Information
**Location**: Multiple places
- **Device Types**: `src/api/device.ts`
- **Device Management**: `src/plugin/devices/`
- **Device Events**: `src/plugin/events/`

### Finding Settings Management
**Location**: `src/plugin/settings.ts`
- Global settings
- Action settings
- Settings getters/setters

### Finding Internationalization
**Location**: Both locations
- **API Level**: `src/api/i18n.ts` - Type definitions
- **Plugin Level**: `src/plugin/i18n.ts` - Implementation

### Finding Connection/WebSocket Code
**Location**: `src/plugin/connection.ts`
- WebSocket setup
- Message handling
- Connection lifecycle

### Finding Manifest Handling
**Location**: `src/plugin/manifest.ts`
- Manifest loading
- Manifest validation
- Plugin metadata

---

## 🔍 Quick Reference by Feature

| Feature | Primary Location | Supporting Files |
|---------|-----------------|------------------|
| **Actions** | `src/plugin/actions/` | `src/plugin/index.ts` |
| **Events** | `src/plugin/events/` | `src/api/events/` |
| **Settings** | `src/plugin/settings.ts` | `src/plugin/ui.ts` |
| **Devices** | `src/plugin/devices/` | `src/api/device.ts` |
| **Localization** | `src/plugin/i18n.ts` | `src/api/i18n.ts` |
| **Logging** | `src/plugin/logging/` | - |
| **WebSocket/Connection** | `src/plugin/connection.ts` | - |
| **Manifest** | `src/plugin/manifest.ts` | `src/api/registration/` |
| **Profiles** | `src/plugin/profiles.ts` | - |
| **Property Inspector** | `src/plugin/ui.ts` | `src/api/layout.ts` |
| **System Info** | `src/plugin/system.ts` | - |
| **Validation** | `src/plugin/validation.ts` | - |

---

## 📚 Development Workflow

### 1. Starting a New Plugin
**Begin at**: Root README.md
- Follow quick start guide
- Use `streamdeck create` CLI command
- Reference `src/plugin/index.ts` for available APIs

### 2. Implementing Actions
**Reference**: `src/plugin/actions/`
- Extend `SingletonAction` class
- Use `@action` decorator
- Implement event handlers (onKeyDown, onDialRotate, etc.)

### 3. Handling Events
**Reference**: `src/plugin/events/`
- Import event types
- Implement event handler methods
- Access event properties

### 4. Managing Settings
**Reference**: `src/plugin/settings.ts`
- Use settings getter/setter methods
- Implement settings validation
- Connect to Property Inspector

### 5. Working with Devices
**Reference**: 
- `src/api/device.ts` - Device types
- `src/plugin/devices/` - Device management

### 6. Adding Internationalization
**Reference**: 
- `src/plugin/i18n.ts` - Implementation
- `src/api/i18n.ts` - Type definitions

---

## 🧪 Testing

### Test Locations
- **Unit Tests**: `src/plugin/__tests__/`
- **Mocks**: `src/__mocks__/` and `src/plugin/__mocks__/`
- **Test Config**: `jest.config.js`

### Running Tests
```bash
npm test          # Run all tests
npm run watch     # Watch mode for development
```

---

## 🏗️ Building and Distribution

### Build Configuration
- **TypeScript Config**: `tsconfig.build.json`
- **Bundler Config**: `rollup.config.mjs`
- **Linting**: `eslint.config.mjs`

### Build Commands
```bash
npm run build     # Build the plugin
npm run watch     # Build and watch for changes
```

---

## 📝 Additional Resources

### Official Documentation
- **SDK Docs**: https://docs.elgato.com/sdk
- **Getting Started**: https://docs.elgato.com/streamdeck/sdk/introduction/getting-started
- **Key Actions**: https://docs.elgato.com/streamdeck/sdk/guides/keys
- **Dial Actions**: https://docs.elgato.com/streamdeck/sdk/guides/dials
- **Manifest Reference**: https://docs.elgato.com/streamdeck/sdk/references/manifest

### Community
- **Discord**: https://discord.gg/GehBUcu627 (Marketplace Makers)
- **Issues**: https://github.com/elgatosf/streamdeck/issues

### Related Repositories
- **CLI Tool**: https://github.com/elgatosf/cli
- **Plugin Samples**: https://github.com/elgatosf/streamdeck-plugin-samples

---

## 💡 Pro Tips

1. **Start with `src/plugin/index.ts`** - This file exports everything you need for plugin development
2. **Check `src/plugin/actions/` first** - Most plugin development revolves around actions
3. **Use TypeScript definitions** - They provide excellent documentation via IntelliSense
4. **Reference the samples** - The [streamdeck-plugin-samples](https://github.com/elgatosf/streamdeck-plugin-samples) repo has working examples
5. **Enable debugging** - Set `"Debug": "enabled"` in your manifest for easier development
6. **Read CHANGELOG.md** - Stay updated on new features and breaking changes

---

## 🎓 Learning Path

### Beginner
1. Read root `README.md`
2. Use `streamdeck create` to generate a plugin
3. Study the generated code structure
4. Examine `src/plugin/index.ts` for available APIs
5. Implement a simple KeyDown handler

### Intermediate
1. Explore `src/plugin/actions/` for action patterns
2. Study `src/plugin/events/` for all event types
3. Implement settings with `src/plugin/settings.ts`
4. Add Property Inspector using `src/plugin/ui.ts`
5. Work with device-specific features in `src/plugin/devices/`

### Advanced
1. Deep dive into `src/api/` for low-level API
2. Understand WebSocket communication in `src/plugin/connection.ts`
3. Implement custom validation in `src/plugin/validation.ts`
4. Add advanced logging with `src/plugin/logging/`
5. Contribute to the SDK itself

---

*This guide is based on the official Elgato Stream Deck SDK repository structure. For the most up-to-date information, always refer to the [official documentation](https://docs.elgato.com/sdk).*
