# Stream Deck Plugin Development Documentation Index

## For AI Agents

This index helps you quickly locate the information you need when assisting with Stream Deck plugin development.

## Quick Navigation

### Starting a New Plugin
→ [Getting Started Guide](guides/getting-started.md)
→ [Plugin Structure](guides/plugin-structure.md)
→ [Simple Plugin Example](examples/simple-plugin.md)

### API Reference
→ [Stream Deck API](api/streamdeck-api.md) - All events and methods
→ [Quick Reference](api/quick-reference.md) - Code snippets and common patterns

### Best Practices
→ [Best Practices Guide](guides/best-practices.md) - Architecture, patterns, optimization

### Advanced Topics
→ [API Integration Example](examples/api-integration.md) - External APIs, polling, async
→ [Manifest Schema](schemas/manifest-schema.md) - Complete manifest.json reference

### Problem Solving
→ [Troubleshooting Guide](troubleshooting/common-issues.md) - Common issues and solutions

## By Task

### "Create a new Stream Deck plugin"
1. Read: [Getting Started](guides/getting-started.md)
2. Reference: [Plugin Structure](guides/plugin-structure.md)
3. Example: [Simple Plugin](examples/simple-plugin.md)
4. Validate: [Manifest Schema](schemas/manifest-schema.md)

### "Handle key presses"
1. Read: [Stream Deck API - keyDown/keyUp events](api/streamdeck-api.md#keydown)
2. Reference: [Quick Reference - Event Flow](api/quick-reference.md#event-flow)
3. Example: [Simple Plugin - handleKeyUp](examples/simple-plugin.md)

### "Update key display (title/image)"
1. Read: [Stream Deck API - setTitle/setImage](api/streamdeck-api.md#settitle)
2. Reference: [Quick Reference - Set Title/Image](api/quick-reference.md#set-title)
3. Best Practice: [Image Handling](guides/best-practices.md#efficient-image-handling)

### "Create property inspector (settings UI)"
1. Read: [Plugin Structure - Property Inspector](guides/plugin-structure.md#htmljavascript-plugins-property-inspector)
2. Example: [Simple Plugin - Property Inspector](examples/simple-plugin.md#propertyinspectorinspectorhtml)
3. Best Practice: [Property Inspector Patterns](guides/best-practices.md#property-inspector-best-practices)

### "Save/load settings"
1. Read: [Stream Deck API - Settings](api/streamdeck-api.md#setsettings)
2. Reference: [Quick Reference - Save Settings](api/quick-reference.md#save-settings)
3. Best Practice: [Settings Caching](guides/best-practices.md#settings-caching)

### "Integrate external API"
1. Example: [API Integration](examples/api-integration.md)
2. Best Practice: [External API Integration](guides/best-practices.md#external-api-integration)
3. Pattern: [Periodic Updates](api/quick-reference.md#periodic-updates)

### "Create toggle/multi-state action"
1. Read: [Plugin Structure - Multi-State Actions](guides/plugin-structure.md#multi-state-actions)
2. Reference: [Quick Reference - Toggle State](api/quick-reference.md#toggle-state)
3. Troubleshoot: [Multi-State Not Working](troubleshooting/common-issues.md#multi-state-actions-not-working)

### "Debug plugin issues"
1. Read: [Troubleshooting Guide](troubleshooting/common-issues.md)
2. Enable: [Debugging Tools](troubleshooting/common-issues.md#debugging-tools)
3. Check: [Common Issues](troubleshooting/common-issues.md#common-issues-and-solutions)

### "Optimize performance"
1. Read: [Performance Optimization](guides/best-practices.md#performance-optimization)
2. Implement: [Debouncing](api/quick-reference.md#debouncing)
3. Implement: [Batch Updates](guides/best-practices.md#batch-updates)

### "Handle errors gracefully"
1. Read: [Error Handling](guides/best-practices.md#error-handling)
2. Reference: [Error Handling Pattern](api/quick-reference.md#error-handling)
3. Implement: [User Feedback](guides/best-practices.md#user-feedback)

## By Event Type

### Plugin Lifecycle Events
- **deviceDidConnect/Disconnect**: [API Reference](api/streamdeck-api.md#devicedidconnect)
- **applicationDidLaunch/Terminate**: [API Reference](api/streamdeck-api.md#applicationdidlaunch)

### Action Events
- **willAppear**: [API Reference](api/streamdeck-api.md#willappear), [Quick Ref](api/quick-reference.md#context-management)
- **willDisappear**: [API Reference](api/streamdeck-api.md#willdisappear), [Best Practice](guides/best-practices.md#cleanup)
- **keyDown/keyUp**: [API Reference](api/streamdeck-api.md#keydown), [Example](examples/simple-plugin.md)
- **titleParametersDidChange**: [API Reference](api/streamdeck-api.md#titleparametersdidchange)

### Settings Events
- **didReceiveSettings**: [API Reference](api/streamdeck-api.md#didreceivesettings), [Pattern](api/quick-reference.md#save-settings)
- **didReceiveGlobalSettings**: [API Reference](api/streamdeck-api.md#didreceiveglobalsettings)

### Property Inspector Events
- **propertyInspectorDidAppear/Disappear**: [API Reference](api/streamdeck-api.md#propertyinspectordidappear)
- **sendToPlugin/PropertyInspector**: [API Reference](api/streamdeck-api.md#sendtopropertyinspector), [Quick Ref](api/quick-reference.md#send-to-property-inspector)

## By Component

### manifest.json
→ [Complete Schema Reference](schemas/manifest-schema.md)
→ [Plugin Structure - manifest.json](guides/plugin-structure.md#manifestjson)
→ [Getting Started - manifest example](guides/getting-started.md#2-create-manifestjson)

### plugin.js (Main Code)
→ [Getting Started - plugin.js](guides/getting-started.md#3-create-pluginjs)
→ [Plugin Architecture](guides/best-practices.md#plugin-architecture)
→ [API Integration Example](examples/api-integration.md#pluginjs)

### Property Inspector
→ [Plugin Structure - Property Inspector](guides/plugin-structure.md#htmljavascript-plugins-property-inspector)
→ [Property Inspector Best Practices](guides/best-practices.md#property-inspector-best-practices)
→ [Example HTML/JS](examples/simple-plugin.md#propertyinspectorinspectorhtml)

### Images
→ [Image Formats](api/streamdeck-api.md#image-formats)
→ [Image Sizes](api/quick-reference.md#image-sizes)
→ [Efficient Image Handling](guides/best-practices.md#efficient-image-handling)

## By Problem Type

### "Plugin not appearing"
→ [Troubleshooting - Plugin Not Appearing](troubleshooting/common-issues.md#plugin-not-appearing-in-stream-deck)

### "WebSocket connection fails"
→ [Troubleshooting - WebSocket Issues](troubleshooting/common-issues.md#websocket-connection-issues)

### "Property Inspector blank"
→ [Troubleshooting - Property Inspector Not Loading](troubleshooting/common-issues.md#property-inspector-not-loading)

### "Images not showing"
→ [Troubleshooting - Images Not Displaying](troubleshooting/common-issues.md#images-not-displaying)

### "Settings not saving"
→ [Troubleshooting - Settings Not Persisting](troubleshooting/common-issues.md#settings-not-persisting)

### "Plugin crashes"
→ [Troubleshooting - Plugin Crashes](troubleshooting/common-issues.md#plugin-crashes-or-hangs)

### "Keys not responding"
→ [Troubleshooting - Actions Not Responding](troubleshooting/common-issues.md#actions-not-responding-to-key-presses)

### "State not changing"
→ [Troubleshooting - Multi-State Issues](troubleshooting/common-issues.md#multi-state-actions-not-working)

## File Organization

```
docs/
├── INDEX.md (this file)
├── api/
│   ├── streamdeck-api.md      # Complete API reference
│   └── quick-reference.md      # Code snippets and patterns
├── guides/
│   ├── getting-started.md      # Beginner tutorial
│   ├── plugin-structure.md     # Plugin organization
│   └── best-practices.md       # Advanced patterns
├── examples/
│   ├── simple-plugin.md        # Basic counter example
│   └── api-integration.md      # Weather API example
├── schemas/
│   └── manifest-schema.md      # Complete manifest reference
└── troubleshooting/
    └── common-issues.md        # Problem solutions
```

## Recommended Reading Order for New Developers

1. **Start Here**: [Getting Started Guide](guides/getting-started.md)
2. **Understand Structure**: [Plugin Structure](guides/plugin-structure.md)
3. **Study Example**: [Simple Plugin Example](examples/simple-plugin.md)
4. **Reference API**: [Stream Deck API](api/streamdeck-api.md)
5. **Learn Best Practices**: [Best Practices Guide](guides/best-practices.md)
6. **Advanced Example**: [API Integration Example](examples/api-integration.md)
7. **Keep Handy**: [Quick Reference](api/quick-reference.md)
8. **When Stuck**: [Troubleshooting Guide](troubleshooting/common-issues.md)

## Keywords for AI Search

**Events**: willAppear, willDisappear, keyDown, keyUp, didReceiveSettings, propertyInspectorDidAppear

**Methods**: setTitle, setImage, setState, showOk, showAlert, setSettings, getSettings, logMessage, openUrl

**Concepts**: context, settings, global settings, property inspector, multi-state, UUID, manifest

**Components**: manifest.json, plugin.js, propertyinspector, images, CodePath

**Issues**: not appearing, not connecting, blank inspector, no images, not saving, crashes, not responding

**Patterns**: debouncing, polling, caching, error handling, async operations, context management

**Devices**: Stream Deck, Stream Deck Mini, Stream Deck XL, Stream Deck Mobile, Keypad, Encoder

## Updates

This documentation is organized for easy reference. When assisting with Stream Deck plugin development:

1. **Always start with the task** - Use the "By Task" section to find relevant docs
2. **Follow examples** - Examples show complete, working implementations
3. **Reference API** - Use API docs for exact syntax and parameters
4. **Check troubleshooting** - When issues arise, start here
5. **Apply best practices** - Use patterns from the best practices guide

## Contributing

When updating this documentation:
- Keep examples complete and working
- Update this index when adding new documents
- Cross-reference related topics
- Include code snippets in guides
- Test all code examples
