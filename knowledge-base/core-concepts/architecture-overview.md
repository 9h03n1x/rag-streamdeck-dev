---
category: core-concepts
title: Stream Deck Plugin Architecture Overview  
tags: [architecture, nodejs, chromium, websocket, runtime, environment]
difficulty: beginner
sdk-version: v2
related-files: [action-development.md, communication-protocol.md]
description: Complete overview of Stream Deck plugin architecture, runtime environments, and communication patterns
---

# Stream Deck Plugin Architecture Overview

## Executive Summary

Stream Deck plugins follow a web application architecture with a frontend (Property Inspector) and backend (Plugin Application Layer), all running locally on the user's machine. Communication happens via WebSocket connections managed by the Stream Deck application.

## Core Architecture

### Host Environment

The Stream Deck plugin architecture consists of three main components:

1. **Application Layer (Backend)** - Node.js runtime
2. **Presentation Layer (Frontend)** - Chromium-based UI  
3. **Stream Deck Application** - WebSocket communication hub

```
┌─────────────────────────────────────────┐
│     Stream Deck Application (Host)      │
│                                          │
│  ┌─────────────┐      ┌──────────────┐  │
│  │  Plugin     │      │  Property    │  │
│  │  (Node.js)  │◄────►│  Inspector   │  │
│  │             │      │  (Chromium)  │  │
│  └─────────────┘      └──────────────┘  │
│         ▲                     ▲          │
│         │                     │          │
│         └─────────┬───────────┘          │
│                   │                      │
│         ┌─────────▼─────────┐            │
│         │   WebSocket       │            │
│         │   Communication   │            │
│         └───────────────────┘            │
└─────────────────────────────────────────┘
```

### JavaScript Runtime Versions

| Stream Deck | Node.js | Chromium |
|---|---|---|
| 7.0 | 20.19.0 | 122.0.6261.171 |
| 6.9 | 20.19.0 | 122.0.6261.171 |
| 6.8 | 20.18.0 | 118.0.5993.220 |
| 6.7 | 20.15.0 | 118.0.5993.220 |
| 6.6 | 20.8.1 | 112.0.5615.213 |

## Plugin Components

### 1. Application Layer

**Runtime**: Node.js 20+
**Responsibilities**: Business logic, event handling, state management, API communications

### 2. Presentation Layer  

**Runtime**: Chromium
**Responsibilities**: User interface, settings input, visual feedback

### 3. Manifest File

**File**: `manifest.json`
**Contents**: Plugin metadata, action definitions, compatibility requirements

## Communication Flow

### WebSocket Architecture

- **Port**: Dynamically assigned
- **Protocol**: WebSocket (ws://)
- **Format**: JSON messages
- **Scope**: localhost only

## File Structure

```
plugin-name/
├── *.sdPlugin/
│   ├── bin/          # Compiled code
│   ├── imgs/         # Assets
│   ├── ui/           # Property inspectors
│   └── manifest.json
├── src/
│   ├── actions/
│   └── plugin.ts
├── package.json
└── tsconfig.json
```

## Security

⚠️ Never bundle secrets in plugins - use OAuth or user-provided credentials

## Best Practices

1. Register all actions before `streamDeck.connect()`
2. Use event-driven programming
3. Handle errors gracefully
4. Clean up resources properly
5. Validate user inputs
6. Use TypeScript for type safety
