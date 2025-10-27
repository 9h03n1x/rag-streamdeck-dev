---
sidebar_label: 'Introduction'
---
# Stream Deck Plugin Development - RAG Repository

Comprehensive documentation for Stream Deck plugin development, optimized for Retrieval-Augmented Generation (RAG) systems.

## 📁 Repository Structure

```
rag-streamdeck-dev/
├── core-concepts/
│   ├── architecture-overview.md
│   ├── action-development.md
│   ├── settings-persistence.md
│   ├── communication-protocol.md
│   └── localization.md
│
├── development-workflow/
│   ├── environment-setup.md
│   ├── build-and-deploy.md
│   ├── debugging-guide.md
│   └── testing-strategies.md
│
├── ui-components/
│   ├── property-inspector-basics.md
│   └── form-components.md
│
├── code-templates/
│   ├── action-templates.md
│   ├── manifest-templates.md
│   ├── property-inspector-templates.md
│   └── common-patterns.md
│
├── security-and-compliance/
│   └── security-requirements.md
│
├── troubleshooting/
│   └── common-issues.md
│
├── reference/
│   ├── api-reference.md
│   ├── cli-commands.md
│   ├── stream-deck-plus-deep-dive.md
│   └── sdk-source-code-guide.md
│
└── examples/
    ├── basic-counter-plugin.md
    └── real-world-plugin-examples.md
```

## 🎯 Purpose

This repository contains structured, comprehensive documentation for Stream Deck plugin development using the official Elgato SDK. All content is:

- **RAG-Optimized**: Structured for easy retrieval and context injection
- **Comprehensive**: Covers all aspects of plugin development
- **Practical**: Includes real-world examples and code templates
- **Up-to-Date**: Based on Stream Deck SDK v2 and Node.js 20

##  Usage as a Git Submodule

This repository is designed to be used as a git submodule in Stream Deck plugin projects to assist AI agents during coding.

### Adding to Your Project

```bash
# Add as a submodule
git submodule add https://github.com/9h03n1x/rag-streamdeck-dev.git .rag

# Initialize and update the submodule
git submodule update --init --recursive
```

### For AI Agents

When assisting with Stream Deck plugin development:
1. Reference the API documentation in `reference/` for SDK methods and events
2. Follow best practices outlined in `core-concepts/` and `development-workflow/`
3. Use examples from `examples/` as templates
4. Check `troubleshooting/` for common issues
5. Use code templates from `code-templates/` for rapid development

## 📚 Content Overview

### Core Concepts
Fundamental architecture, action development, settings management, communication protocols, and internationalization.

### Development Workflow
Environment setup, build processes, debugging techniques, and testing strategies.

### UI Components
Property inspector development, form components, and user interface patterns.

### Code Templates
Ready-to-use templates for actions, manifests, property inspectors, and common patterns.

### Security & Compliance
Security requirements, credential handling, and best practices.

### Troubleshooting
Common issues, solutions, and debugging approaches.

### Reference
Complete API documentation, CLI commands, Stream Deck Plus advanced features, and SDK source code navigation guide.

### Examples
Full working examples including basic counter plugin and real-world plugin samples from official Elgato repository.

## 🚀 Usage with RAG Systems

This documentation is structured to work optimally with RAG systems:

1. **Vector Database**: Chunk documents by section headers
2. **Semantic Search**: Find relevant sections based on queries
3. **Context Injection**: Inject relevant sections into LLM context
4. **Code Generation**: Use templates and examples for code synthesis

## 📖 Key Topics Covered

- Plugin architecture and runtime environment
- SingletonAction class and event handling
- Settings persistence (action and global)
- WebSocket communication protocol
- Property Inspector (UI) development
- Build and deployment workflows
- Debugging with VS Code and Chrome DevTools
- Security best practices
- Cross-platform development (Windows/macOS)
- Stream Deck + (dial and touchscreen) advanced features
- Testing strategies and patterns
- Internationalization (i18n) and localization
- Real-world plugin examples with advanced patterns
- SDK source code navigation and internal APIs

## 🔧 Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **SDK**: @elgato/streamdeck
- **UI**: HTML/CSS/JavaScript with sdpi-components
- **Build**: Rollup
- **Tools**: Stream Deck CLI

## 📝 Documentation Standards

All documentation follows these standards:

- **Clear Headers**: Hierarchical structure for easy navigation
- **Code Examples**: Practical, working code snippets
- **Best Practices**: Industry standards and recommendations
- **Type Safety**: TypeScript examples throughout
- **Error Handling**: Proper error management patterns
- **Security**: Security considerations included

## 🎓 Learning Path

Recommended reading order for beginners:

1. `core-concepts/architecture-overview.md`
2. `development-workflow/environment-setup.md`
3. `core-concepts/action-development.md`
4. `examples/basic-counter-plugin.md`
5. `ui-components/property-inspector-basics.md`
6. `core-concepts/settings-persistence.md`
7. `development-workflow/debugging-guide.md`
8. `examples/real-world-plugin-examples.md`

For advanced developers:

1. `reference/stream-deck-plus-deep-dive.md`
2. `reference/sdk-source-code-guide.md`
3. `core-concepts/localization.md`

## 🔗 Official Resources

- [Stream Deck SDK Documentation](https://docs.elgato.com/streamdeck/sdk)
- [Stream Deck CLI](https://docs.elgato.com/streamdeck/cli)
- [Marketplace](https://marketplace.elgato.com)
- [GitHub - Stream Deck SDK](https://github.com/elgatosf/streamdeck)
- [Official Plugin Samples](https://github.com/elgatosf/streamdeck-plugin-samples)

## 📄 License

Documentation compiled from official Elgato Stream Deck SDK documentation.

## 🤝 Contributing

This is a curated documentation repository. For SDK issues or questions:
- [Marketplace Makers Discord](https://discord.gg/GehBUcu627)
- [Elgato Support](https://help.elgato.com)

To update this knowledge base:
1. Add new documentation in the appropriate subdirectory
2. Keep documentation clear, concise, and example-focused
3. Update this README if adding new categories

## 🎯 Use Cases

This documentation repository supports:

- AI-powered plugin development assistants
- Developer onboarding and training
- Code generation systems
- Technical documentation chatbots
- Plugin architecture analysis
- Best practices enforcement
- Security audit preparation
- RAG-based development workflows

## 🌟 Features

- ✅ Complete API reference
- ✅ Working code examples
- ✅ Security guidelines
- ✅ Debugging strategies
- ✅ Testing patterns
- ✅ Build configurations
- ✅ Deployment workflows
- ✅ Cross-platform support
- ✅ TypeScript throughout
- ✅ RAG-optimized structure
- ✅ Internationalization guide
- ✅ Stream Deck Plus advanced features
- ✅ Real-world plugin examples
- ✅ SDK source code navigation

---

**Version**: 1.0  
**Last Updated**: October 2025  
**SDK Version**: Stream Deck SDK v2 (Node.js 20+)
