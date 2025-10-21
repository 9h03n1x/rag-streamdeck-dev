# Foundation for a Stream Deck Plugin Code Generation Knowledge Base

A comprehensive technical specification for generative AI models tasked with developing high-quality Stream Deck plugins using the Elgato Node.js SDK (v3).

---

## Table of Contents

1. [Architectural Mandates & Environment Setup](#architectural-mandates--environment-setup)
2. [Core Action Development (Backend Logic)](#core-action-development-backend-logic)
3. [Data Persistence and Security Protocol](#data-persistence-and-security-protocol)
4. [Property Inspector (UI) Communication Blueprint](#property-inspector-ui-communication-blueprint)
5. [Debugging Property Inspectors and Developer Tools](#debugging-property-inspectors-and-developer-tools)
6. [Usability and Experience (UX) Criteria](#usability-and-experience-ux-criteria)
7. [Knowledge Base Structure & RAG Optimization](#knowledge-base-structure--rag-optimization)
8. [Prescriptive Schema Templates](#prescriptive-schema-templates)
9. [Actionable Directives](#actionable-directives)

---

## Architectural Mandates & Environment Setup

### Host Environment and Runtime Separation

The Stream Deck architecture relies on **explicit separation between application logic and configuration interface**:

- **Application Layer (Backend):** Operates exclusively within Node.js runtime
  - **Required Version:** Node.js v20.19.0 (strict requirement)
  - **Version Manager:** nvm (macOS) or nvm-windows (Windows)
  - Node.js v20 LTS is the fixed ceiling for available JavaScript/TypeScript features
  - Features requiring later Node.js versions will cause silent failures

- **Presentation Layer (Property Inspector/UI):** Rendered as HTML view in localized Chromium
  - Full DOM access available
  - Separate execution context from backend

**Critical Constraint:** Backend and frontend do NOT communicate directly. All communication is exclusively mediated by Stream Deck using **WebSocket protocol**.

### Development Workflow and Tooling Requirements

**Mandatory Tools:**

1. **Stream Deck CLI**
   ```bash
   npm install -g @elgato/cli@latest
   ```

2. **Project Initialization**
   ```bash
   streamdeck create
   ```
   - Automatically establishes standardized file structure
   - Non-negotiable hierarchy required

3. **Directory Structure**
   ```
   *.sdPlugin/
   ├── bin/
   ├── imgs/
   ├── ui/
   ├── manifest.json
   src/
   ├── actions/
   └── plugin.ts
   ```

4. **Development Commands**
   ```bash
   npm run build          # Compile source code
   npm run watch         # Hot-reloading during development
   streamdeck validate   # Validate plugin structure
   streamdeck pack       # Package into .streamDeckPlugin
   ```

**Quality Assurance Gate:** Code generation must produce output that **passes all validation and packaging steps** successfully.

### Plugin Manifest (manifest.json) Requirements

The manifest.json file is the **primary metadata descriptor** and first point of validation.

#### Schema Compliance Requirements

**Must Include:**
```json
{
  "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
  "Name": "Descriptive Plugin Name",
  "UUID": "com.example.plugin.unique-id",
  "SDKVersion": 3,
  "Software": {
    "MinimumVersion": "6.0"
  }
}
```

#### Manifest Properties Reference

| Property | Type | Description | Mandatory Constraint |
|----------|------|-------------|----------------------|
| `$schema` | string | URL reference to official JSON schema | Enforced for validation |
| `Name` | string | User-facing descriptive name (e.g., "Color Picker") | Unique, descriptive, concise |
| `UUID` | string | Unique identifier in reverse-DNS format | Lowercase alphanumeric, periods, hyphens only |
| `SDKVersion` | number | Specifies preferred SDK version | Must be 3 |
| `Nodejs` | object | Configuration options for Node.js runtime | Should include `--enable-source-maps` |

#### Best Practices

- **Identity Metadata:** Use Marketplace organization name, company name, or real name for authorship
- **Strict Prohibition:** No copyright infringement or offensive vocabulary
- **Reverse-DNS Format:** UUID must follow convention (e.g., `com.yourcompany.pluginname`)

---

## Core Action Development (Backend Logic)

### The SingletonAction Class Blueprint

All functional components must inherit from `SingletonAction`.

#### Basic Structure

```typescript
import { SingletonAction, DidReceiveSettingsEvent, KeyDownEvent, WillAppearEvent } from "@elgato/streamdeck";

type Settings = {
  count: number;
  enabled: boolean;
};

@action({ UUID: "com.example.counter" })
export class CounterAction extends SingletonAction<Settings> {
  async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    // Initialize state
  }

  async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    // Handle key press
  }

  async onKeyUp(): Promise<void> {
    // Handle key release
  }

  async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
    // Handle configuration changes
  }
}
```

#### TypeScript Generics (CRITICAL)

**Mandate:** Use TypeScript Generics to enforce strong typing for action settings.

```typescript
// CORRECT: Type-safe settings
class MyAction extends SingletonAction<{ apiKey: string; timeout: number }> {
  async onKeyDown(ev: KeyDownEvent<{ apiKey: string; timeout: number }>) {
    const settings = ev.payload.settings;
    // Intellisense available; compile-time validation
  }
}

// INCORRECT: No type safety
class MyAction extends SingletonAction {
  async onKeyDown(ev: KeyDownEvent) {
    const settings = ev.payload.settings; // Any type; no validation
  }
}
```

**Benefits:**
- Compile-time validation
- Full Intellisense support
- Prevents runtime errors from typos or missing properties

#### Action Registration

```typescript
import { streamDeck } from "@elgato/streamdeck";

// In main plugin file
streamDeck.actions.registerAction(new CounterAction());
await streamDeck.connect();
```

### Event Handling and Action Lifecycle

#### Primary User Interaction Events

**onKeyDown** and **onKeyUp**
- Fired on physical key press and release
- **CRITICAL:** Must be `async` functions
- Use `await` for I/O operations
- Prevents blocking the Node.js event loop

```typescript
async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
  // Read current state
  const settings = ev.payload.settings;
  
  // Perform async operation
  await this.fetchData();
  
  // Update UI
  await ev.action.setTitle("Processing...");
}
```

#### Initialization Anchor: onWillAppear

**When Fired:**
- Stream Deck launches
- User navigates to page containing the action
- Action becomes visible

**Required Initializations:**

```typescript
async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
  // 1. Read persistent settings
  const settings = ev.payload.settings;
  
  // 2. Set initial key display
  await ev.action.setTitle(settings.title || "Default");
  await ev.action.setImage("/path/to/icon.png");
  
  // 3. Establish any persistent connections
  this.initializeConnection();
  
  // 4. Restore previous state
  this.restoreState(settings);
}
```

#### Other Lifecycle Events

| Event | Purpose | Typical Use |
|-------|---------|------------|
| `onWillDisappear` | Action becomes hidden | Cleanup, save state |
| `onDidReceiveSettings` | Configuration changed | React to user config changes |
| `onDidReceiveGlobalSettings` | Global plugin settings changed | Update based on global state |
| `onTitleParametersDidChange` | Title parameters updated | Handle dynamic titles |

### Dynamic Key State Management and Visual Feedback

#### Setting Key Title

```typescript
await ev.action.setTitle("New Title");
```

#### Setting Key Image

```typescript
// CRITICAL: Always include options parameter
await ev.action.setImage(
  "/path/to/icon.png",
  { target: Target.HardwareAndSoftware } // Default but explicit
);
```

**Target Option Significance:**
- `Target.HardwareAndSoftware` (Default) → Updates both physical device AND Stream Deck app
- **DO NOT OVERRIDE** without explicit reason
- Ensures seamless visual consistency for users

#### Multi-State Actions

```typescript
// Define states in manifest
// In action handler:
await ev.action.setState(index); // 0, 1, 2, etc.
```

#### Real-Time Feedback Pattern

```typescript
async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
  // Immediate visual feedback
  await ev.action.setImage("/images/processing.png");
  
  // Perform operation
  const result = await this.performOperation();
  
  // Final feedback
  if (result.success) {
    await ev.action.setImage("/images/success.png");
  } else {
    await ev.action.setImage("/images/error.png");
  }
}
```

---

## Data Persistence and Security Protocol

### Action Settings (Instance-Specific Data)

Action settings are configuration data persisted as JSON objects against specific action instances.

#### Reading Settings (Recommended Pattern)

**BEST PRACTICE:** Access settings directly from event arguments

```typescript
async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
  // Preferred: Data guaranteed to be current
  const settings = ev.payload.settings;
  
  // AVOID: Unnecessary async call
  // const settings = await ev.action.getSettings();
}
```

**Why Preferred:**
- Payload data guaranteed current at event trigger
- Reduces latency
- No unnecessary async calls to host

#### Writing Settings (Asynchronous)

```typescript
async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
  // Update settings
  const newSettings = { 
    ...ev.payload.settings,
    count: ev.payload.settings.count + 1 
  };
  
  // CRITICAL: Must use await
  await ev.action.setSettings(newSettings);
  
  // After await completes, backend receives
  // confirmation via onDidReceiveSettings
}
```

**Why await is mandatory:**
- Ensures data integrity
- Persists before subsequent code executes
- Triggers `onDidReceiveSettings` confirmation

### Mandatory Security Constraints

#### 🚨 SECURITY VIOLATION: Storing Credentials in Settings

**CRITICAL RULE:** Action settings and global settings are stored as **plain-text**.

**Consequences:**
- Settings automatically included when users export profiles
- Credentials exposed if profile shared or leaked
- Violates security best practices

#### Prohibited Patterns

```typescript
// ❌ VIOLATION: Never do this
type Settings = {
  apiKey: string;        // VIOLATION
  authToken: string;     // VIOLATION
  password: string;      // VIOLATION
  secretKey: string;     // VIOLATION
};

// ❌ VIOLATION: Never prompt for credentials
// Property Inspector code that requests secrets
const apiKey = await promptUser("Enter API Key:");
await ev.action.setSettings({ apiKey }); // VIOLATION
```

#### Approved Mitigation Strategies

**Option 1: Environment Variables**
```typescript
// Read from secure environment configuration
const apiKey = process.env.API_KEY; // Set outside plugin
```

**Option 2: Platform-Specific Credential Stores**

**macOS Keychain:**
```typescript
// Use keychain integration
const credential = await retrieveFromKeychain("api-key");
```

**Windows Credential Manager:**
```typescript
// Use Windows credential APIs
const credential = await retrieveFromCredentialManager("api-key");
```

**Option 3: OAuth Flow with Secure Backend**
```typescript
// Redirect to secure authentication
// Store tokens server-side
// Plugin receives session token only
```

#### General Security Best Practices

- ✅ Robust input validation for all user-provided data
- ✅ Avoid insecure deserialization
- ✅ Handle all I/O operations asynchronously
- ✅ Never block the Node.js event loop
- ✅ Use HTTPS for all external communication
- ✅ Validate and sanitize all data from external APIs

---

## Property Inspector (UI) Communication Blueprint

### WebSocket Connection and Client Abstraction

#### Connection Establishment

The UI environment (Chromium) establishes connection:

```typescript
// Receives parameters from Stream Deck
window.connectElgatoStreamDeckSocket = function(port, uuid, registerEvent, info, actionInfo) {
  // Connection established
};
```

#### Simplified Communication with sdpi-components

**Recommended:** Use sdpi-components library for abstraction

```html
<script src="https://cdn.elgato.com/streamdeck/2.0/ui.js"></script>
<script src="https://cdn.elgato.com/streamdeck/2.0/property-inspector.js"></script>
```

```typescript
// Get settings from plugin
const globalSettings = await SDPIComponents.streamDeckClient.getGlobalSettings();

// Listen for updates
document.addEventListener('didReceiveGlobalSettings', (ev) => {
  // Handle received settings
});
```

### Frontend-Backend Data Exchange Protocol

#### UI Sending Data to Plugin (Configuration)

```typescript
// Send configuration from Property Inspector
SDPIComponents.streamDeckClient.sendToPlugin({
  payload: {
    newSetting: "value",
    count: 42
  }
});
```

**Plugin Backend Receives:**
```typescript
// In backend action class
async onSendToPlugin(ev: SendToPluginEvent): Promise<void> {
  const payload = ev.payload;
  // Process configuration change
}
```

#### Plugin Sending Data to UI (Feedback/Updates)

```typescript
// Backend sends to Property Inspector
ev.action.sendToPropertyInspector({
  type: "updateStatus",
  message: "Device connected",
  data: { connectionTime: Date.now() }
});
```

**Property Inspector Receives:**
```typescript
// In Property Inspector (UI)
document.addEventListener('didReceiveSendToPropertyInspector', (ev) => {
  const message = ev.payload;
  // Update UI based on message
});
```

#### Communication Best Practices

```typescript
// Structure payloads consistently
interface PluginMessage {
  action: string;           // Action type
  context: string;          // Action instance ID
  payload: Record<string, unknown>; // Data
  timestamp: number;        // For debugging
}

// Always validate received data
async onSendToPlugin(ev: SendToPluginEvent<Settings>): Promise<void> {
  const payload = ev.payload;
  
  // Validate structure
  if (!payload || typeof payload !== 'object') {
    console.error('Invalid payload received');
    return;
  }
  
  // Process
}
```

---


---

## Debugging Property Inspectors and Developer Tools

This section documents essential debugging techniques learned during production plugin development.

# 🔍 Stream Deck Plugin Debugging Guide

Complete guide for debugging Stream Deck plugins, with focus on property inspectors and settings persistence.

## Table of Contents

- [Quick Start](#quick-start)
- [Developer Mode](#developer-mode)
- [Remote Debugger](#remote-debugger)
- [Property Inspector Debugging](#property-inspector-debugging)
- [Plugin Logging](#plugin-logging)
- [Common Issues](#common-issues)
- [Best Practices](#best-practices)

---

## Quick Start

```bash
# 1. Enable developer mode
streamdeck dev

# 2. Open remote debugger in browser
# Navigate to: http://localhost:23654/

# 3. View plugin logs
streamdeck logs com.nicco-hagedorn.eve-control-deck

# 4. Restart plugin after changes
streamdeck restart com.nicco-hagedorn.eve-control-deck
```

---

## Developer Mode

### What is Developer Mode?

Developer mode enables the **remote debugger** on port 23654, allowing you to inspect property inspector HTML/JavaScript using Chrome DevTools.

### Enable Developer Mode

```bash
streamdeck dev
```

**Expected Output:**
```
✔ Developer mode enabled
```

### Verify It's Enabled

1. Open browser to: **http://localhost:23654/**
2. You should see a list of inspectable pages
3. If you see "Unable to connect", developer mode is not enabled

### When is Developer Mode Required?

- ✅ **Required for:**
  - Debugging property inspector HTML/CSS/JavaScript
  - Inspecting DOM structure
  - Viewing browser console errors
  - Testing JavaScript in real-time

- ❌ **NOT required for:**
  - Plugin TypeScript debugging (use logs instead)
  - Building and testing plugin functionality
  - Normal plugin development

---

## Remote Debugger

### Accessing the Remote Debugger

1. **Enable developer mode** (if not already):
   ```bash
   streamdeck dev
   ```

2. **Open the property inspector:**
   - In Stream Deck app, click on any action button
   - Property inspector panel appears on the right
   - **CRITICAL:** Property inspector MUST be visible to debug it!

3. **Open remote debugger in browser:**
   - Navigate to: **http://localhost:23654/**
   - You'll see a list of available pages

4. **Find your property inspector:**
   - Look for your HTML file name (e.g., `session-stats.html`)
   - Or look for the page title (e.g., "Session Stats Tracker")

5. **Click "inspect":**
   - Opens Chrome DevTools for that page
   - Now you can debug like a normal web page!

### Remote Debugger Interface

When you open http://localhost:23654/, you'll see something like:

```
Inspectable pages

session-stats.html
  Inspect

wallet.html
  Inspect

login.html
  Inspect
```

**Note:** Only property inspectors that are **currently visible** appear in this list!

---

## Property Inspector Debugging

### The Property Inspector Stack

```
Stream Deck App
    ↓
Property Inspector (Chromium Web View)
    ↓
Your HTML + sdpi-components.js
    ↓
WebSocket connection to plugin
    ↓
Plugin (Node.js process)
```

### Step-by-Step Debugging

#### 1. Check if sdpi-components.js Loaded

In the **Console** tab:

```javascript
// Check if library exists
SDPIComponents
// Should output: Object { streamDeckClient: ..., ... }

// If undefined, the library didn't load
```

**If undefined:**
- Check file exists: `ui/sdpi-components.js`
- Check script tag: `<script src="sdpi-components.js"></script>`
- Check Network tab for 404 error

#### 2. Check Stream Deck Client

```javascript
// Check client object
SDPIComponents.streamDeckClient
// Should output: Object { on: function, getSettings: function, ... }
```

#### 3. Test Settings Persistence

```javascript
// Get current settings
await SDPIComponents.streamDeckClient.getSettings()
// Should output: Object { sessionName: "...", trackISK: true, ... }

// Set a test value
await SDPIComponents.streamDeckClient.setSettings({ testValue: "hello" })

// Get settings again
await SDPIComponents.streamDeckClient.getSettings()
// Should now include: { testValue: "hello", ... }
```

#### 4. Test Component Binding

1. **Type in a text field** in the property inspector
2. **Run in console:**
   ```javascript
   await SDPIComponents.streamDeckClient.getSettings()
   ```
3. **Check if the property appears** with the value you typed

**If property is missing:**
- Check component has `setting="propertyName"` attribute
- Check component is an sdpi component (e.g., `<sdpi-textfield>`)
- Check for JavaScript errors in console

#### 5. Monitor Setting Changes

```javascript
// Listen for all setting changes
SDPIComponents.streamDeckClient.on('didReceiveSettings', (event) => {
    console.log('Settings changed:', event.settings);
});
```

Now interact with components and watch the console for updates.

### Chrome DevTools Tabs

#### Console Tab
- View JavaScript errors and warnings
- Run JavaScript commands
- Test API calls
- Monitor events

**Useful commands:**
```javascript
// Clear console
clear()

// View all available sdpi-components
Object.keys(SDPIComponents)

// Get settings
await SDPIComponents.streamDeckClient.getSettings()

// Set settings
await SDPIComponents.streamDeckClient.setSettings({ key: "value" })
```

#### Elements Tab
- Inspect DOM structure
- Verify component attributes
- Check if components rendered correctly
- Test CSS styling

**Look for:**
- `<sdpi-textfield setting="...">` has correct `setting` attribute
- Components are inside `<sdpi-item>` containers
- No broken/missing elements

#### Network Tab
- Check if `sdpi-components.js` loaded (Status: 200 OK)
- Check if images/CSS loaded
- Monitor API calls (if any)

**Common issues:**
- 404 on sdpi-components.js → File missing or wrong path
- 403/CORS errors → File permissions issue

#### Application Tab
- View localStorage (if used)
- Inspect cookies (if used)
- Check service workers (not commonly used)

---

## Plugin Logging

### View Real-Time Logs

```bash
streamdeck logs com.nicco-hagedorn.eve-control-deck
```

### Log Files Location

```
com.nicco-hagedorn.eve-control-deck.sdPlugin/logs/
├── com.nicco-hagedorn.eve-control-deck.0.log  (current)
├── com.nicco-hagedorn.eve-control-deck.1.log
└── ...
```

### Adding Debug Logging

#### In TypeScript Actions

```typescript
import { streamDeck } from "@elgato/streamdeck";

// Log levels
streamDeck.logger.info("Info message");
streamDeck.logger.warn("Warning message");
streamDeck.logger.error("Error message");
streamDeck.logger.debug("Debug message"); // Only in debug mode
```

#### Log Settings Changes

```typescript
import { DidReceiveSettingsEvent } from "@elgato/streamdeck";

override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
    const settings = ev.payload.settings;
    
    // Log all settings
    streamDeck.logger.info(
        `[YourAction] Settings received:`,
        JSON.stringify(settings)
    );
    
    // Log specific properties
    streamDeck.logger.info(`[YourAction] Custom setting: ${settings.customProperty}`);
}
```

#### Log When Action Appears

```typescript
override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    const settings = ev.payload.settings;
    streamDeck.logger.info(
        `[YourAction] Action appeared with settings:`,
        JSON.stringify(settings)
    );
}
```

### Filtering Logs

```bash
# View only Session Stats logs (Windows)
streamdeck logs com.nicco-hagedorn.eve-control-deck | findstr "Session Stats"

# View only errors
streamdeck logs com.nicco-hagedorn.eve-control-deck | findstr "ERROR"

# View specific action
streamdeck logs com.nicco-hagedorn.eve-control-deck | findstr "Wallet"
```

---

## Common Issues

### Issue 1: Settings Not Persisting

**Symptoms:**
- Type in property inspector field
- Close property inspector
- Reopen → value is gone

**Diagnosis:**
1. Open remote debugger console
2. Type in the field
3. Run: `await SDPIComponents.streamDeckClient.getSettings()`
4. Check if property appears in settings

**Solutions:**

✅ **Add `setting` attribute:**
```html
<!-- ❌ Wrong -->
<sdpi-textfield placeholder="Name"></sdpi-textfield>

<!-- ✅ Correct -->
<sdpi-textfield setting="userName" placeholder="Name"></sdpi-textfield>
```

✅ **Use sdpi components, not regular HTML:**
```html
<!-- ❌ Wrong -->
<input type="text" id="userName" />

<!-- ✅ Correct -->
<sdpi-textfield setting="userName"></sdpi-textfield>
```

✅ **Wrap in sdpi-item:**
```html
<!-- ✅ Correct -->
<sdpi-item label="User Name">
    <sdpi-textfield setting="userName"></sdpi-textfield>
</sdpi-item>
```

### Issue 2: SDPIComponents is Not Defined

**Symptoms:**
```
Uncaught ReferenceError: SDPIComponents is not defined
```

**Solutions:**

✅ **Check file exists:**
```bash
# File should exist at:
ui/sdpi-components.js
```

✅ **Download if missing:**
```bash
curl -o ui/sdpi-components.js https://sdpi-components.dev/releases/v4/sdpi-components.js
```

✅ **Check script tag in HTML:**
```html
<head>
    <meta charset="utf-8" />
    <script src="sdpi-components.js"></script>  <!-- Correct path -->
</head>
```

✅ **Check Network tab:**
- Open remote debugger
- Go to Network tab
- Refresh property inspector
- Look for `sdpi-components.js` → should be Status 200

### Issue 3: Property Inspector Appears Blank

**Symptoms:**
- Property inspector opens but shows nothing
- Or shows error message

**Diagnosis:**
1. Open remote debugger
2. Check Console tab for JavaScript errors
3. Check Elements tab to see if DOM rendered

**Common Causes:**

❌ **JavaScript error before DOM renders:**
```javascript
// This will crash if SDPIComponents not loaded
const client = SDPIComponents.streamDeckClient; // Error!
```

✅ **Wait for DOM ready:**
```javascript
// Safe - runs after library loaded
document.addEventListener('DOMContentLoaded', () => {
    const { streamDeckClient } = SDPIComponents;
    // Now safe to use
});
```

❌ **Syntax error in JavaScript:**
```javascript
const settings = {
    name: "test"  // Missing comma or bracket
```

✅ **Check console for exact error line**

### Issue 4: Settings Received in Plugin But Wrong Values

**Symptoms:**
- Plugin logs show settings received
- But values are default/old values

**Diagnosis:**
```typescript
override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
    streamDeck.logger.info('Settings:', JSON.stringify(ev.payload.settings));
}
```

**Common Causes:**

❌ **Property name mismatch:**
```html
<!-- Property inspector -->
<sdpi-textfield setting="sessionName"></sdpi-textfield>

<!-- Plugin looks for wrong name -->
settings.sessionTemplate  // Wrong! Should be settings.sessionName
```

❌ **Caching old settings:**
```typescript
// Don't cache settings globally
private cachedSettings: Settings; // Dangerous!

// Always get fresh from event
const settings = ev.payload.settings; // Good!
```

### Issue 5: Changes in Property Inspector Don't Trigger Plugin Update

**Symptoms:**
- Type in property inspector
- Plugin doesn't receive `onDidReceiveSettings` event

**Solutions:**

✅ **Implement the event handler:**
```typescript
import { DidReceiveSettingsEvent } from "@elgato/streamdeck";

override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
    // This is required to receive setting changes
    streamDeck.logger.info('Settings changed:', ev.payload.settings);
}
```

✅ **Check plugin logs:**
```bash
streamdeck logs com.nicco-hagedorn.eve-control-deck | findstr "Settings"
```

---

## Best Practices

### Property Inspector HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <!-- Load sdpi-components in head -->
    <script src="sdpi-components.js"></script>
</head>
<body>
    <!-- Use sdpi-item containers -->
    <sdpi-item label="Setting Name">
        <!-- Use sdpi components with setting attribute -->
        <sdpi-textfield 
            setting="propertyName"
            placeholder="Enter value"
            maxlength="50"
        ></sdpi-textfield>
    </sdpi-item>

    <!-- Custom JavaScript at end of body -->
    <script>
        const { streamDeckClient } = SDPIComponents;
        
        streamDeckClient.on('didReceiveSettings', ({ settings }) => {
            console.log('Settings updated:', settings);
        });
    </script>
</body>
</html>
```

### TypeScript Action Class

```typescript
import {
    action,
    JsonObject,
    SingletonAction,
    WillAppearEvent,
    DidReceiveSettingsEvent
} from "@elgato/streamdeck";
import { streamDeck } from "@elgato/streamdeck";

interface MySettings extends JsonObject {
    customProperty?: string;
    enableFeature?: boolean;
}

@action({ UUID: "com.company.plugin.action" })
export class MyAction extends SingletonAction<MySettings> {
    
    override async onWillAppear(ev: WillAppearEvent<MySettings>): Promise<void> {
        const settings = ev.payload.settings;
        
        // Initialize defaults
        if (settings.customProperty === undefined) {
            settings.customProperty = "default";
            await ev.action.setSettings(settings);
        }
        
        streamDeck.logger.info('[MyAction] Appeared:', JSON.stringify(settings));
    }
    
    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<MySettings>): Promise<void> {
        const settings = ev.payload.settings;
        streamDeck.logger.info('[MyAction] Settings changed:', JSON.stringify(settings));
        
        // Update display based on new settings
        await this.updateDisplay(ev.action, settings);
    }
}
```

### Development Workflow

```bash
# 1. Make changes to TypeScript or HTML
# 2. Build
npm run build

# 3. Restart plugin
streamdeck restart com.nicco-hagedorn.eve-control-deck

# 4. Test
# - Open property inspector
# - Make changes
# - Check logs

# 5. Debug if needed
streamdeck dev  # Enable developer mode
# Open http://localhost:23654/
# Inspect property inspector

# 6. View logs
streamdeck logs com.nicco-hagedorn.eve-control-deck
```

### Watch Mode (Recommended)

```bash
npm run watch
```

This automatically:
- Rebuilds on file changes
- Restarts the plugin
- Saves time during development

---

## Debugging Checklist

When property inspector settings aren't working, check:

- [ ] `sdpi-components.js` file exists in `ui/` folder
- [ ] Script tag loads sdpi-components.js in `<head>`
- [ ] Using `<sdpi-textfield>` not `<input>` elements
- [ ] All input components have `setting="propertyName"` attribute
- [ ] Components wrapped in `<sdpi-item label="...">` containers
- [ ] No JavaScript errors in remote debugger console
- [ ] `SDPIComponents` is defined in console
- [ ] `onDidReceiveSettings` handler implemented in plugin
- [ ] Plugin logs show settings being received
- [ ] Property names match between HTML and TypeScript
- [ ] Developer mode enabled if debugging HTML/JS
- [ ] Property inspector is visible when checking remote debugger

---

## Resources

### Official Documentation
- [Elgato SDK - Property Inspectors](https://docs.elgato.com/sdk/plugins/property-inspector)
- [sdpi-components Documentation](https://sdpi-components.dev/)
- [Stream Deck CLI Commands](https://docs.elgato.com/streamdeck/cli/)

### Example Projects
- [sdpi-components Example](https://github.com/GeekyEggo/sdpi-components/blob/main/example/pi/index.html)
- [Stream Deck Counter Template](https://github.com/elgatosf/streamdeck-counter-template)

### Useful Links
- Remote Debugger: http://localhost:23654/
- Stream Deck Marketplace: https://marketplace.elgato.com/
- EVE ESI Status: https://status.eveonline.com/

---

**Happy Debugging! 🐛🔍**


---

## Usability and Experience (UX) Criteria

UX compliance is **mandatory for Marketplace submission** and critical for user satisfaction.

### Functional and Metadata Requirements

#### Action Scoping

**Recommended Range:** 2-30 distinct actions per plugin

| Below 2 Actions | 2-30 Actions | Above 30 Actions |
|-----------------|-------------|------------------|
| ❌ Too niche | ✅ Ideal scope | ❌ Monolithic |
| Consider feature scope | Well-defined | Consider splitting |
| May not justify plugin | Focused | Too complex |

**Guideline:** If exceeding 30 actions, consider splitting into multiple plugins.

#### Configuration Consolidation

**Best Practice:** Actions sharing common settings should be consolidated

```typescript
// ❌ POOR: Separate actions for each variant
class RedButtonAction extends SingletonAction { }
class BlueButtonAction extends SingletonAction { }
class GreenButtonAction extends SingletonAction { }

// ✅ GOOD: Single action with configuration
class ColorButtonAction extends SingletonAction<{ color: string }> { }
```

#### Metadata Quality

**Naming Guidelines:**
- ✅ Descriptive and concise: "Volume Controller"
- ✅ Clear functionality: "Color Picker"
- ❌ Avoid jargon: NOT "My Company's Volume Control Tool"
- ❌ Avoid vague names: NOT "Utility" or "Helper"

### Visual Assets and Iconography Standards

#### High DPI Requirement

**Mandatory:** Provide two size variants for rasterized images

```
image.png          (72 x 72 px)   - Standard DPI
image@2x.png       (144 x 144 px) - High DPI
```

**Consequence of Missing @2x:** Degraded visual quality on high-resolution screens

#### Format Recommendations

| Asset Type | Standard Size | High DPI Size | Recommended Format |
|-----------|--------------|--------------|-------------------|
| Key Icon (Static) | 72 x 72 | 144 x 144 | SVG (recommended), PNG, JPEG |
| Key Icon (Programmatic) | N/A | 144 x 144 | Higher DPI raster |
| Category Icon | 28 x 28 | 56 x 56 | PNG, JPEG |
| Action Icon | 20 x 20 | 40 x 40 | PNG, JPEG |

#### Programmatic Image Updates

**Rule:** When programmatically updating images, use higher resolution

```typescript
// CORRECT: Use 144x144 for programmatic updates
await ev.action.setImage("/icons/status@2x.png", {
  target: Target.HardwareAndSoftware
});

// Stream Deck handles scaling automatically
// Visual fidelity guaranteed
```

#### SVG Best Practices

```typescript
// SVG scales perfectly across all devices
const svgPath = "/icons/action.svg";
await ev.action.setImage(svgPath);

// No @2x variant needed
// Optimal rendering at any resolution
```

---

## Knowledge Base Structure & RAG Optimization

### Principles of Machine-Readable Documentation

#### RAG Optimization Strategy

**Semantic Chunking:** Break knowledge into small, coherent units based on entity

```
GOOD:
- Single chunk: "onKeyDown Event Handler"
  Includes: signature, behavior, example code, constraints

POOR:
- Large document: "All Event Handlers"
  Bundled together, context lost, harder retrieval
```

**Benefits:**
- Focused context retrieval
- Minimizes token limits
- Reduces misinterpretation
- Complete examples per topic

#### Context Management for LLM

Each technical definition must include:

1. **Concise, clear language** (minimize jargon)
2. **Standardized code examples** (verified, working)
3. **Associated constraints** (security, performance)
4. **Usage context** (when/where to use)
5. **Related entities** (interconnected topics)

### Code Graph Schema for Stream Deck SDK

#### Node Types (Entities)

```
Nodes (V):
├── ActionClass          # Class inheriting SingletonAction
├── EventHandler         # Lifecycle event methods
├── SettingsPayload      # Typed settings configuration
├── ManifestProperty     # manifest.json fields
├── CLI_Command          # streamdeck CLI commands
├── SecurityConstraint   # Security requirements
└── UX_Guideline        # User experience standards
```

#### Relationship Types (Connections)

```
Relationships (R):
├── inherits_from        # Counter → SingletonAction
├── responds_to          # onKeyDown → KeyDownEvent
├── configures           # SettingsPayload → ActionClass
├── requires_property    # Manifest → UUID
├── violates             # SettingsPayload → SecurityConstraint
├── requires_await       # setSettings → Async_Operation
└── belongs_to           # EventHandler → ActionClass
```

#### Constraint Linking Example

```
Graph:
SettingsPayload (apiKey: string)
  ↓ violates
SecurityConstraint (PlainTextStorageRisk)
  ↓ mitigated_by
  ├── EnvironmentVariable
  ├── KeychainStorage
  └── OAuthBackend

Action: LLM detects violation → rejects or modifies generated code
```

---

## Prescriptive Schema Templates

### Action Intent Schema (Input Model)

This schema structures developer requests into machine-processable format:

```json
{
  "RequestID": "req-2025-001",
  "ActionUUID": "com.example.counter",
  "SDKVersion": "nodejs-v3",
  "SettingsDefinition": {
    "count": "number",
    "maxCount": "number",
    "title": "string"
  },
  "RequiredHandlers": [
    "onKeyDown",
    "onWillAppear",
    "onDidReceiveSettings"
  ],
  "FunctionalGoal": "On key down: Read settings, increment counter, update title. Max 100. On key up: Visual feedback. Configuration: Set title prefix and max value.",
  "RequiresUI": true,
  "Constraints": [
    "No API keys in settings",
    "Must handle rapid key presses",
    "Visual feedback required"
  ]
}
```

### API Function Annotation Schema

Every SDK method documented with structured metadata:

```json
{
  "APIName": "setSettings",
  "ContainerClass": "SingletonAction<T>",
  "TypeScriptSignature": "setSettings(settings: T): Promise<void>",
  "UsageContext": [
    "onKeyDown",
    "onWillAppear",
    "onDidReceiveSettings"
  ],
  "LLM_Functional_Meaning": "Persists configuration data asynchronously to the action instance. After completion, triggers onDidReceiveSettings globally. Must be awaited to ensure data integrity.",
  "Associated_Constraints": [
    "Awaiting_Mandatory",
    "Security_Warning: No Credentials",
    "Non_Blocking_Required"
  ],
  "Verified_Code_Snippet": "await ev.action.setSettings({ count: newValue });"
}
```

#### Reference Implementation

```typescript
// Annotation tells LLM:
// - ALWAYS use await
// - Never store apiKey in settings
// - Triggers onDidReceiveSettings after completion
// - Used in configuration workflows

await ev.action.setSettings(newSettings);
```

---

## Actionable Directives

### Summary of Non-Negotiable Requirements

#### 1. Strict Runtime Environment

- **Fixed Version:** Node.js v20.19.0 only
- **No Workarounds:** Features requiring later versions cause failures
- **Implication:** Generated code must use only Node.js v20 LTS features

#### 2. Type Safety Requirement

- **Mandate:** All backend logic uses TypeScript
- **Generics Required:** `SingletonAction<SettingsType>`
- **Enforcement:** Compile-time validation prevents runtime errors

```typescript
// REQUIRED pattern
class MyAction extends SingletonAction<Settings> {
  async onKeyDown(ev: KeyDownEvent<Settings>) {
    // Full type safety
  }
}
```

#### 3. Security Constraint Priority

- **Zero Tolerance:** No credentials in plain-text settings
- **Graph Detection:** Knowledge base flags violations automatically
- **Enforcement Mechanism:** Generated code actively rejects insecure patterns

#### 4. Asynchronous and Reactive Paradigm

- **All I/O:** Must use `async/await`
- **Never Block:** Event loop must remain responsive
- **Communication:** Event-driven via WebSocket (never direct HTTP)

```typescript
// CORRECT: Async I/O
async onKeyDown(ev: KeyDownEvent<Settings>) {
  await ev.action.setSettings(data);
  await ev.action.setTitle("Updated");
}

// ❌ WRONG: Blocking operation
await this.sleep(5000); // Blocks event loop
```

#### 5. UX and Visual Compliance

- **High DPI Mandatory:** All assets include @2x variants
- **Programmatic Updates:** Use 144x144 px sizing
- **Scope:** 2-30 actions per plugin
- **Metadata:** Descriptive, jargon-free naming

#### 6. Tooling Integration

- **CLI Mandatory:** Use `streamdeck` commands
- **Validation:** Must pass `streamdeck validate`
- **Packaging:** Generates `.streamDeckPlugin` distribution
- **File Structure:** Enforce standard layout

```bash
streamdeck create    # Initialize
npm run build        # Compile
streamdeck validate  # Verify
streamdeck pack      # Package
```

### Quality Assurance Checklist

Before code generation completes, verify:

- [ ] TypeScript with generics for all actions
- [ ] No credentials in settings payloads
- [ ] All I/O operations use `async/await`
- [ ] manifest.json includes `$schema` property
- [ ] UUID in reverse-DNS format
- [ ] All images include @2x variants
- [ ] onWillAppear handles initialization
- [ ] WebSocket for UI communication (not HTTP)
- [ ] Action count: 2-30 per plugin
- [ ] Plugin passes CLI validation

### Knowledge Base Deployment

The knowledge base foundation defined requires:

1. **Structured Entity Mapping:** All SDK components stored with relationship graph
2. **Security Constraint Indexing:** Violations flagged during synthesis
3. **Schema Enforcement:** Input/output templates ensure compliance
4. **Semantic Chunking:** Knowledge segmented for accurate RAG retrieval
5. **Verified Code Patterns:** All examples tested and working

---

## References

### Official Resources

- [Elgato Stream Deck SDK Documentation](https://docs.elgato.com)
- [Stream Deck CLI](https://github.com/elgato/cli)
- [Manifest JSON Schema](https://schemas.elgato.com/streamdeck/plugins/manifest.json)
- [Stream Deck Marketplace Guidelines](https://docs.elgato.com/sdk/plugins/marketplace)

### Key Specifications

- Stream Deck Version: 6.0+
- Node.js SDK Version: 3
- Node.js Runtime: v20.19.0 LTS
- Plugin Distribution Format: `.streamDeckPlugin`

---

## Appendix: Quick Reference

### Action Template

```typescript
import { SingletonAction, KeyDownEvent, WillAppearEvent } from "@elgato/streamdeck";

type Settings = {
  // Define your settings here
};

@action({ UUID: "com.example.myaction" })
export class MyAction extends SingletonAction<Settings> {
  async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    // Initialize when action becomes visible
  }

  async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    // Handle key press
    await ev.action.setTitle("Pressed");
  }

  async onKeyUp(): Promise<void> {
    // Handle key release
  }
}
```

### Manifest Template

```json
{
  "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
  "Name": "My Plugin",
  "UUID": "com.example.myplugin",
  "SDKVersion": 3,
  "Software": {
    "MinimumVersion": "6.0"
  },
  "Actions": [
    {
      "Name": "My Action",
      "UUID": "com.example.myaction",
      "Icon": "imgs/action-icon"
    }
  ]
}
```

### Plugin Registration

```typescript
import { streamDeck } from "@elgato/streamdeck";
import { MyAction } from "./actions/myaction";

streamDeck.actions.registerAction(new MyAction());
await streamDeck.connect();
```

---

**Document Version:** 1.0  
**Last Updated:** October 2025  
**Framework:** Elgato Stream Deck SDK v3 (Node.js)