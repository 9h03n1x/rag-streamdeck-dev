# Guide for AI Agents Using This RAG

## Purpose

This document provides instructions for AI agents on how to effectively use this RAG (Retrieval-Augmented Generation) repository when assisting developers with Stream Deck plugin development.

## Quick Start for AI Agents

When a user asks for help with Stream Deck plugin development:

1. **Start with [INDEX.md](INDEX.md)** - This is your navigation hub
2. **Identify the task** - Use the "By Task" section in INDEX.md
3. **Reference appropriate documentation** - Follow the links to relevant guides
4. **Provide complete examples** - Use code snippets from examples and guides
5. **Include error handling** - Always show proper error handling patterns

## Common User Requests and Where to Look

### "Create a new Stream Deck plugin"
**Primary Resource**: [guides/getting-started.md](guides/getting-started.md)

**What to do:**
1. Guide user through the basic structure
2. Show complete manifest.json example
3. Provide working plugin.js template
4. Explain the registration process
5. Show how to test the plugin

**Reference these:**
- [Plugin Structure](guides/plugin-structure.md)
- [Simple Plugin Example](examples/simple-plugin.md)
- [Manifest Schema](schemas/manifest-schema.md)

### "My plugin isn't working"
**Primary Resource**: [troubleshooting/common-issues.md](troubleshooting/common-issues.md)

**What to do:**
1. Ask diagnostic questions (What error? What behavior?)
2. Check common issues in troubleshooting guide
3. Verify manifest.json structure
4. Check WebSocket connection code
5. Review event handler implementation

**Common causes:**
- Invalid manifest.json (syntax errors, missing fields)
- Incorrect registration code
- Wrong command line argument parsing
- Context management issues

### "How do I update the key display?"
**Primary Resources**: 
- [api/streamdeck-api.md#settitle](api/streamdeck-api.md)
- [api/quick-reference.md#set-title](api/quick-reference.md)

**What to do:**
1. Show setTitle example
2. Show setImage example (including base64 and SVG)
3. Explain target parameter (0=both, 1=hardware, 2=software)
4. Show dynamic image generation with SVG
5. Discuss image caching for performance

### "How do I save settings?"
**Primary Resources**:
- [api/streamdeck-api.md#setsettings](api/streamdeck-api.md)
- [guides/plugin-structure.md#global-settings-vs-action-settings](guides/plugin-structure.md)

**What to do:**
1. Explain difference between action settings and global settings
2. Show setSettings code
3. Show getSettings code
4. Show didReceiveSettings handler
5. Explain when to use each type
6. Show property inspector integration

### "How do I integrate an external API?"
**Primary Resource**: [examples/api-integration.md](examples/api-integration.md)

**What to do:**
1. Show complete API integration example
2. Explain async/await patterns
3. Show error handling for API failures
4. Demonstrate periodic updates/polling
5. Show loading states and user feedback
6. Discuss rate limiting and caching

### "How do I create a toggle action?"
**Primary Resources**:
- [guides/plugin-structure.md#multi-state-actions](guides/plugin-structure.md)
- [api/quick-reference.md#toggle-state](api/quick-reference.md)

**What to do:**
1. Show manifest.json with multiple States
2. Explain state tracking
3. Show setState method usage
4. Provide complete toggle example
5. Explain state synchronization if needed

## Code Generation Guidelines

### Always Include:

1. **Error Handling**
```javascript
try {
  // Operation
} catch (error) {
  console.error('Error:', error);
  ws.send(JSON.stringify({
    event: 'showAlert',
    context: context
  }));
}
```

2. **Context Management**
```javascript
const contexts = new Map();

function handleWillAppear(message) {
  contexts.set(message.context, {
    settings: message.payload.settings
  });
}

function handleWillDisappear(message) {
  contexts.delete(message.context);
}
```

3. **Proper WebSocket Connection**
```javascript
const port = process.argv[2];
const pluginUUID = process.argv[3];
const registerEvent = process.argv[4];
const info = JSON.parse(process.argv[5]);

const ws = new WebSocket(`ws://127.0.0.1:${port}`);

ws.on('open', () => {
  ws.send(JSON.stringify({
    event: registerEvent,
    uuid: pluginUUID
  }));
});
```

4. **Complete Event Handling**
```javascript
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    handleMessage(message);
  } catch (error) {
    console.error('Error:', error);
  }
});
```

### Manifest.json Guidelines:

1. **Always validate UUID format** - Must be reverse domain notation
2. **Include both platforms** - macOS and Windows
3. **Provide correct paths** - No extensions for Icon/Image paths
4. **Set appropriate versions** - SDKVersion: 2, MinimumVersion: "4.1"
5. **Include all required fields** - Name, Version, Author, Actions, etc.

### Best Practices to Follow:

1. **Use descriptive variable names**
2. **Add comments for complex logic**
3. **Implement proper cleanup** - Clear timers, remove contexts
4. **Use debouncing** - For frequent updates
5. **Cache images** - Don't recreate them on every update
6. **Log appropriately** - Use logMessage for debugging
7. **Provide user feedback** - Use showOk/showAlert
8. **Handle async properly** - Use async/await, catch errors

## Documentation Structure Understanding

```
docs/
├── INDEX.md                    # Start here - Navigation hub
├── AI-AGENT-GUIDE.md          # This file
├── api/
│   ├── streamdeck-api.md      # Complete API reference
│   └── quick-reference.md      # Quick code snippets
├── guides/
│   ├── getting-started.md      # Beginner tutorial
│   ├── plugin-structure.md     # Architecture guide
│   └── best-practices.md       # Advanced patterns
├── examples/
│   ├── simple-plugin.md        # Basic complete example
│   └── api-integration.md      # Advanced API example
├── schemas/
│   └── manifest-schema.md      # manifest.json reference
└── troubleshooting/
    └── common-issues.md        # Problem solutions
```

## Response Template

When answering questions, structure responses like this:

1. **Brief Explanation** - What the user wants to accomplish
2. **Code Example** - Complete, working code
3. **Explanation** - Line-by-line if complex
4. **Related Concepts** - Link to related documentation
5. **Common Issues** - What to watch out for

Example response structure:
```
To create a toggle action in Stream Deck, you need to:

1. Define multiple states in manifest.json
2. Track the current state
3. Use setState to change the state

Here's a complete example:

[Code example]

Key points:
- manifest.json needs at least 2 states
- Track state in your code
- Use setState method to switch

For more details, see:
- [Plugin Structure - Multi-State Actions](guides/plugin-structure.md#multi-state-actions)
- [Quick Reference - Toggle State](api/quick-reference.md#toggle-state)
```

## What NOT to Do

1. **Don't provide partial code** - Always give complete, runnable examples
2. **Don't skip error handling** - Always include try-catch blocks
3. **Don't forget context management** - Always track contexts properly
4. **Don't ignore cleanup** - Always handle willDisappear
5. **Don't use placeholders** - Provide actual working code
6. **Don't skip validation** - Validate manifest.json, settings, inputs
7. **Don't hardcode values** - Use settings and configuration

## Verification Checklist

Before providing code, verify:

- [ ] WebSocket connection code is correct
- [ ] Plugin registration is present
- [ ] All event handlers are implemented
- [ ] Error handling is included
- [ ] Context management is proper
- [ ] Settings save/load correctly
- [ ] manifest.json is valid JSON
- [ ] UUIDs use reverse domain notation
- [ ] Images paths don't include extensions
- [ ] Cleanup code is present (willDisappear)

## Advanced Topics

When users ask about advanced features:

### Performance Optimization
→ [guides/best-practices.md#performance-optimization](guides/best-practices.md)
- Debouncing
- Batch updates
- Image caching

### State Synchronization
→ [guides/best-practices.md#state-management](guides/best-practices.md)
- Tracking multiple instances
- Syncing state across instances

### External API Integration
→ [examples/api-integration.md](examples/api-integration.md)
- HTTP requests
- Polling patterns
- Error handling
- Rate limiting

### Security
→ [guides/best-practices.md#security-best-practices](guides/best-practices.md)
- Credential storage
- Input sanitization
- URL validation

## Keep Updated

As you assist users:
1. Note common questions not covered
2. Identify gaps in documentation
3. Suggest improvements to examples
4. Report unclear explanations

## Summary

**Your role**: Provide accurate, complete, and working Stream Deck plugin code based on this RAG.

**Your approach**: 
1. Consult INDEX.md to find relevant documentation
2. Provide complete examples from guides and examples
3. Include error handling and best practices
4. Reference related documentation
5. Help debug with troubleshooting guide

**Your goal**: Enable developers to create robust, well-structured Stream Deck plugins efficiently.
