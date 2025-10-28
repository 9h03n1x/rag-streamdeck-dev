---
sidebar_label: 'Introduction'
sidebar_position: 1
---

# Welcome to Stream Deck Plugin Development 🎮

Build powerful, professional Stream Deck plugins with the official Elgato SDK. This comprehensive documentation covers everything from your first "Hello World" plugin to advanced features like Stream Deck+ dials, encoders, and AI-powered development workflows.

:::tip Quick Start
New to Stream Deck development? Start with our [Environment Setup Guide](./getting-started/environment-setup.md) and build your [First Plugin](./getting-started/first-plugin.md) in under 10 minutes!
:::

## 🚀 What You'll Learn

This documentation will teach you how to:

- **Build Custom Actions**: Create interactive buttons with dynamic titles, images, and states
- **Handle User Input**: Respond to key presses, dial rotations, and touchscreen interactions
- **Persist Settings**: Save and manage user preferences and action configurations
- **Create Beautiful UIs**: Design property inspectors with forms, dropdowns, and custom components
- **Deploy Professionally**: Package, test, and publish your plugins to the Elgato Marketplace
- **Debug Effectively**: Use VS Code and Chrome DevTools to troubleshoot issues
- **Support Stream Deck+**: Leverage dials, encoders, and touch displays for advanced interactions

## 🎯 Why This Documentation?

### 📚 Comprehensive Coverage
Complete documentation for the **Stream Deck SDK v2** with Node.js 20+, covering every API, event, and feature.

### 🤖 AI-Powered
Built-in **RAG (Retrieval-Augmented Generation)** system using Google Gemini. Ask questions and get instant answers:
```bash
npm run test:query
```

### 💡 Real-World Examples
Learn from actual working plugins, not just theory. Every concept includes practical code examples.

### 🔄 Always Up-to-Date
Based on the latest official Elgato SDK documentation and best practices.

## 🗺️ Documentation Structure

Our documentation is organized into focused sections to help you find what you need quickly:

### 🎓 Getting Started
Perfect for beginners. Set up your environment and build your first plugin.
- [Environment Setup](./getting-started/environment-setup.md)
- [Your First Plugin](./getting-started/first-plugin.md)

### 🧠 Core Concepts
Understand the fundamental architecture and patterns.
- [Architecture Overview](./core-concepts/architecture-overview.md)
- [Action Development](./core-concepts/action-development.md)
- [Settings Persistence](./core-concepts/settings-persistence.md)
- [Communication Protocol](./core-concepts/communication-protocol.md)
- [Stream Deck+ Deep Dive](./core-concepts/stream-deck-plus-deep-dive.md)

### 🛠️ Development Guide
Master the development workflow from coding to deployment.
- [Build & Deploy](./development-guide/build-and-deploy.md)
- [Debugging Guide](./development-guide/debugging-guide.md)
- [Testing Strategies](./development-guide/testing-strategies.md)
- [Localization](./development-guide/localization.md)
- [CI/CD Complete Guide](./development-guide/ci-cd-complete.md)

### 🎨 UI Components
Create beautiful, user-friendly property inspectors.
- [Property Inspector Basics](./ui-components/property-inspector-basics.md)
- [Form Components](./ui-components/form-components.md)

### 📋 Code Templates
Ready-to-use templates to accelerate development.
- [Action Templates](./code-templates/action-templates.md)
- [Manifest Templates](./code-templates/manifest-templates.md)
- [Property Inspector Templates](./code-templates/property-inspector-templates.md)
- [Common Patterns](./code-templates/common-patterns.md)

### 🔒 Security
Build secure plugins that protect user data.
- [Security Requirements](./security/security-requirements.md)
- [Compliance Guide](./security/compliance-guide.md)

### 🚀 Advanced Topics
Take your plugins to the next level.
- [OAuth Implementation](./advanced-topics/oauth-implementation.md)
- [Network Operations](./advanced-topics/network-operations.md)
- [Performance Profiling](./advanced-topics/performance-profiling.md)
- [Analytics & Telemetry](./advanced-topics/analytics-and-telemetry.md)
- [Device-Specific Development](./advanced-topics/device-specific-development.md)

### 🔍 Troubleshooting
Solve common issues and debug effectively.
- [Common Issues](./troubleshooting/common-issues.md)
- [Diagnostic Flowcharts](./troubleshooting/diagnostic-flowcharts.md)

### 📖 API Reference
Complete API documentation and CLI commands.
- [API Reference](./api-reference/api-reference.md)
- [CLI Commands](./api-reference/cli-commands.md)
- [SDK Source Code Guide](./api-reference/sdk-source-code-guide.md)

### 💡 Examples
Learn from real, working plugins.
- [Basic Counter Plugin](./examples/basic-counter-plugin.md)
- [Real-World Plugin Examples](./examples/real-world-plugin-examples.md)

## 🎓 Recommended Learning Path

### For Beginners

Start here if you're new to Stream Deck plugin development:

1. **[Architecture Overview](./core-concepts/architecture-overview.md)** - Understand how plugins work
2. **[Environment Setup](./getting-started/environment-setup.md)** - Install required tools
3. **[Your First Plugin](./getting-started/first-plugin.md)** - Build a working plugin
4. **[Action Development](./core-concepts/action-development.md)** - Learn the action lifecycle
5. **[Basic Counter Plugin](./examples/basic-counter-plugin.md)** - Study a complete example
6. **[Property Inspector Basics](./ui-components/property-inspector-basics.md)** - Create user interfaces
7. **[Settings Persistence](./core-concepts/settings-persistence.md)** - Save user preferences
8. **[Debugging Guide](./development-guide/debugging-guide.md)** - Fix issues effectively

### For Experienced Developers

Jump straight to advanced topics:

1. **[Stream Deck+ Deep Dive](./core-concepts/stream-deck-plus-deep-dive.md)** - Dials, encoders, and touch displays
2. **[SDK Source Code Guide](./api-reference/sdk-source-code-guide.md)** - Navigate the SDK internals
3. **[OAuth Implementation](./advanced-topics/oauth-implementation.md)** - Integrate with external services
4. **[Performance Profiling](./advanced-topics/performance-profiling.md)** - Optimize your plugins
5. **[CI/CD Complete Guide](./development-guide/ci-cd-complete.md)** - Automate your workflow

## 🤖 AI-Powered Development

This documentation includes a built-in **RAG (Retrieval-Augmented Generation)** system powered by Google Gemini and LlamaIndex.ts.

### Ask Questions Instantly

```bash
# Install dependencies
npm install

# Ingest documentation into vector store
npm run ingest

# Ask questions
npm run test:query
```

The RAG system can answer questions like:
- "How do I create a basic Stream Deck plugin?"
- "What's the difference between action settings and global settings?"
- "How do I handle dial rotation events on Stream Deck+?"
- "Show me an example of OAuth implementation"

### Use as a Git Submodule

Add this documentation to your plugin project for AI-assisted development:

```bash
# Add as a submodule
git submodule add https://github.com/9h03n1x/rag-streamdeck-dev.git .rag

# Initialize and update
git submodule update --init --recursive
```

Your AI coding assistant can now reference the complete Stream Deck SDK documentation!

## 🔧 Technology Stack

Build modern, professional plugins with the latest tools:

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js 20+ |
| **Language** | TypeScript |
| **SDK** | @elgato/streamdeck (v2) |
| **UI Framework** | HTML/CSS/JavaScript |
| **UI Components** | sdpi-components |
| **Build Tool** | Rollup |
| **CLI** | Stream Deck CLI |
| **Package Manager** | npm / yarn / pnpm |

## ✨ Key Features

This documentation provides:

- ✅ **Complete API Reference** - Every SDK method, event, and property documented
- ✅ **Working Code Examples** - Copy-paste ready code snippets
- ✅ **Security Guidelines** - Best practices for credential handling and data protection
- ✅ **Debugging Strategies** - VS Code and Chrome DevTools integration
- ✅ **Testing Patterns** - Unit tests, integration tests, and manual testing guides
- ✅ **Build Configurations** - Rollup, TypeScript, and bundling setup
- ✅ **Deployment Workflows** - From development to Marketplace publication
- ✅ **Cross-Platform Support** - Windows and macOS development
- ✅ **TypeScript Throughout** - Type-safe examples and patterns
- ✅ **RAG-Optimized Structure** - AI-friendly documentation format
- ✅ **Internationalization Guide** - Multi-language plugin support
- ✅ **Stream Deck+ Features** - Dials, encoders, and touch displays
- ✅ **Real-World Examples** - Production-ready plugin samples

## 🔗 Official Resources

Connect with the Stream Deck developer community and access official resources:

- 📖 [Stream Deck SDK Documentation](https://docs.elgato.com/streamdeck/sdk) - Official SDK docs
- 🛠️ [Stream Deck CLI](https://docs.elgato.com/streamdeck/cli) - Command-line tools
- 🏪 [Elgato Marketplace](https://marketplace.elgato.com) - Publish your plugins
- 💻 [GitHub - Stream Deck SDK](https://github.com/elgatosf/streamdeck) - SDK source code
- 📦 [Official Plugin Samples](https://github.com/elgatosf/streamdeck-plugin-samples) - Example plugins
- 💬 [Marketplace Makers Discord](https://discord.gg/GehBUcu627) - Developer community
- 🆘 [Elgato Support](https://help.elgato.com) - Technical support

## 🚀 Quick Links

Ready to start building? Here are the most popular pages:

- **[Environment Setup](./getting-started/environment-setup.md)** - Get your dev environment ready
- **[Your First Plugin](./getting-started/first-plugin.md)** - Build a plugin in 10 minutes
- **[API Reference](./api-reference/api-reference.md)** - Complete SDK API documentation
- **[Common Issues](./troubleshooting/common-issues.md)** - Solve problems quickly
- **[Real-World Examples](./examples/real-world-plugin-examples.md)** - Learn from production plugins

## 🤝 Contributing

This is a curated documentation repository for the Stream Deck developer community.

**For SDK Issues or Questions:**
- Join the [Marketplace Makers Discord](https://discord.gg/GehBUcu627)
- Contact [Elgato Support](https://help.elgato.com)

**To Improve This Documentation:**
1. Fork the repository
2. Add or update documentation in the appropriate section
3. Keep content clear, concise, and example-focused
4. Submit a pull request

## 📄 License & Attribution

Documentation compiled from official Elgato Stream Deck SDK documentation and community contributions.

---

<div style={{textAlign: 'center', marginTop: '2rem', padding: '1rem', background: 'var(--ifm-color-emphasis-100)', borderRadius: '8px'}}>

**Ready to build something amazing?**

[Get Started →](./getting-started/environment-setup.md) | [View Examples →](./examples/basic-counter-plugin.md) | [API Reference →](./api-reference/api-reference.md)

</div>

---

**Documentation Version**: 1.0
**Last Updated**: January 2025
**SDK Version**: Stream Deck SDK v2 (Node.js 20+)
**Maintained by**: [9h03n1x](https://github.com/9h03n1x)
