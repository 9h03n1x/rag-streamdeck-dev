# Stream Deck Plugin Development Index

Use this file as the navigation hub for the markdown knowledge base. The repository focuses on maintained, canonical markdown files; generated sites, vector stores, and legacy archive trees are intentionally out of scope.

This index follows a **lifecycle journey** from starting a plugin project to shipping and maintaining it. Use this journey to find articles in the order they matter to new plugin developers. Each section includes links to templates, code examples, and deeper reference material.

## 1. Start: Orientation and Foundations

Begin here if you are new to Stream Deck plugin development.

- [GETTING_STARTED.md](GETTING_STARTED.md) - prerequisites, SDK baseline, and orientation for new vs. existing plugin developers
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - command and API quick lookup for developers who know the basics
- [core-concepts/architecture-overview.md](core-concepts/architecture-overview.md) - how Stream Deck plugins are structured: plugins, actions, Property Inspector, and communication

## 2. Learn: Core Concepts

Understand the mental models and building blocks before writing your first action.

- [core-concepts/action-development.md](core-concepts/action-development.md) - `SingletonAction`, action lifecycle, event handling, and visual feedback patterns
- [core-concepts/communication-protocol.md](core-concepts/communication-protocol.md) - plugin-to-Property Inspector messaging
- [core-concepts/settings-persistence.md](core-concepts/settings-persistence.md) - action and global settings, storage, and state management
- [core-concepts/stream-deck-plus-deep-dive.md](core-concepts/stream-deck-plus-deep-dive.md) - Stream Deck Plus features: dials, touchstrip, layouts, and touch feedback

## 3. Build: Setup, Development, and Testing

Get your local environment ready and build your first plugin.

- [development-workflow/environment-setup.md](development-workflow/environment-setup.md) - Node.js, Stream Deck CLI, editor, and tools
- [development-workflow/sdk-2-1-0-update-guide.md](development-workflow/sdk-2-1-0-update-guide.md) - SDK 2.1.0 baseline and version-specific guidance
- [development-workflow/build-and-deploy.md](development-workflow/build-and-deploy.md) - local builds, packaging, testing, and installation
- [development-workflow/debugging-guide.md](development-workflow/debugging-guide.md) - logs, breakpoints, DevTools, and common failure modes
- [development-workflow/testing-strategies.md](development-workflow/testing-strategies.md) - unit test design and SDK mocking
- [development-workflow/ci-cd-complete.md](development-workflow/ci-cd-complete.md) - GitHub Actions, GitLab CI, and release automation

### First Complete Example

- [examples/basic-counter-plugin.md](examples/basic-counter-plugin.md) - walkthrough of a complete working plugin with settings, UI, and local state

## 4. Design UI: Property Inspector and User Interaction

Build interactive control panels and responsive UI for Stream Deck devices.

- [ui-components/property-inspector-basics.md](ui-components/property-inspector-basics.md) - Property Inspector communication, HTML boilerplate, and message handling
- [ui-components/form-components.md](ui-components/form-components.md) - SDPI components and form building
- [advanced-topics/advanced-property-inspector.md](advanced-topics/advanced-property-inspector.md) - input validation, dynamic UI, tabs, state delegation, and accessibility
- [code-templates/property-inspector-templates.md](code-templates/property-inspector-templates.md) - copy-ready PI HTML and JavaScript templates

## 5. Integrate and Secure: Network, OAuth, Secrets, and Privacy

Connect your plugin to external services safely and responsibly.

- [advanced-topics/network-operations.md](advanced-topics/network-operations.md) - HTTP/WebSocket patterns, retry logic, caching, offline behavior, and plugin-safe practices
- [advanced-topics/oauth-implementation.md](advanced-topics/oauth-implementation.md) - Core OAuth 2.0 architecture, token storage, refresh, and callback handling
- [advanced-topics/oauth-provider-setup.md](advanced-topics/oauth-provider-setup.md) - Provider-specific setup for Google, Spotify, Twitch, GitHub, Discord
- [security-and-compliance/secrets-management.md](security-and-compliance/secrets-management.md) - managing API keys, marketplace-provided secrets, and `.env` files
- [advanced-topics/analytics-and-telemetry.md](advanced-topics/analytics-and-telemetry.md) - privacy-first telemetry, opt-in patterns, and GDPR/CCPA alignment
- [security-and-compliance/security-requirements.md](security-and-compliance/security-requirements.md) - security checklist and review requirements

## 6. Ship: Packaging, Submission, and Marketplace

Prepare your plugin for release and marketplace submission.

- [marketplace/submission-guide.md](marketplace/submission-guide.md) - marketplace console, submission workflow, and publisher profile setup
- [marketplace/approval-checklist.md](marketplace/approval-checklist.md) - release readiness verification before submission
- [marketplace/profile-publishing.md](marketplace/profile-publishing.md) - plugin profiles, device strategies, and dependency planning
- [legal/compliance-guide.md](legal/compliance-guide.md) - legal, accessibility, and regulatory compliance checklist

## 7. Reference: API and Artifact Lookup

Quick lookup for SDK details, manifest schema, CLI commands, and migration notes.

- [reference/api-reference.md](reference/api-reference.md) - Stream Deck SDK API methods and events with examples
- [reference/manifest-schema.md](reference/manifest-schema.md) - `manifest.json` schema reference
- [reference/cli-commands.md](reference/cli-commands.md) - Stream Deck CLI command reference
- [reference/sdk-source-code-guide.md](reference/sdk-source-code-guide.md) - official SDK source structure and file layout
- [reference/sdk-v1-to-v2-migration.md](reference/sdk-v1-to-v2-migration.md) - migration from SDK v1 to v2 patterns
- [reference/sdk-2-1-0-github-audit.md](reference/sdk-2-1-0-github-audit.md) - latest SDK comparison and KB gap audit

## 8. Examples: Focused Scenarios and Patterns

Learn by exploring specialized implementations beyond the basic counter.

- [examples/calendar-dial-carousel.md](examples/calendar-dial-carousel.md) - Stream Deck Plus dial UI patterns and carousel interaction
- [examples/real-world-plugin-examples.md](examples/real-world-plugin-examples.md) - production patterns and advanced use cases

### Code Templates

- [code-templates/action-templates.md](code-templates/action-templates.md) - action class boilerplate and patterns
- [code-templates/manifest-templates.md](code-templates/manifest-templates.md) - manifest.json templates for common scenarios
- [code-templates/common-patterns.md](code-templates/common-patterns.md) - reusable TypeScript patterns and utilities
- [development-workflow/localization.md](development-workflow/localization.md) - i18n and translation workflows

## 9. Troubleshoot: Problem-Solving and Diagnosis

Diagnose and fix common issues in setup, runtime, and user interaction.

- [troubleshooting/common-issues.md](troubleshooting/common-issues.md) - setup failures, runtime crashes, PI communication bugs, and state issues
- [troubleshooting/diagnostic-flowcharts.md](troubleshooting/diagnostic-flowcharts.md) - decision trees for diagnosing complex problems

## 10. Advanced Topics: Specialized Patterns and Optimization

Explore specialized topics for mature plugins or performance optimization.

- [advanced-topics/device-specific-development.md](advanced-topics/device-specific-development.md) - adapting behavior for different Stream Deck hardware versions
- [advanced-topics/managing-multiple-instances.md](advanced-topics/managing-multiple-instances.md) - managing state when the same action appears multiple times
- [advanced-topics/multi-action-coordination.md](advanced-topics/multi-action-coordination.md) - shared state and event bus patterns across actions
- [advanced-topics/performance-profiling.md](advanced-topics/performance-profiling.md) - profiling, memory optimization, and rendering performance
- [advanced-topics/versioning-and-migrations.md](advanced-topics/versioning-and-migrations.md) - plugin versioning, settings migration, and backwards compatibility

## 11. AI Tools: Using AI Assistants for Plugin Development

Set up and use AI coding assistants alongside your plugin project. Covers Claude Desktop and GitHub Copilot in VS Code.

### Claude Desktop

- [ai-tools/claude-desktop-getting-started.md](ai-tools/claude-desktop-getting-started.md) - install Claude Desktop, create a project, upload files, and write effective prompts
- [ai-tools/claude-desktop-mcp-streamdeck.md](ai-tools/claude-desktop-mcp-streamdeck.md) - configure MCP filesystem access so Claude can read this knowledge base and your plugin source without copy-pasting

### GitHub Copilot in VS Code

- [ai-tools/copilot-vscode-getting-started.md](ai-tools/copilot-vscode-getting-started.md) - install Copilot, set up custom instructions, use Copilot Edits and agent mode
- [ai-tools/copilot-agents-and-prompts.md](ai-tools/copilot-agents-and-prompts.md) - all built-in agents (`@workspace`, `@terminal`, `@github`), slash commands, and ready-to-use `.prompt.md` templates for Stream Deck development

### Development Methodology

- [ai-tools/agent-spec-driven-development.md](ai-tools/agent-spec-driven-development.md) - spec-first, test-driven workflow: write a plain-language spec, translate it into failing tests, then let the agent implement against the test suite until all tests are green

## Maintenance and Governance

These documents track the knowledge base itself, not your plugin.

- [../CONTRIBUTING.md](../CONTRIBUTING.md) - documentation style, article types, and contribution rules
- [information-architecture-audit.md](information-architecture-audit.md) - IA review, content-retention plan, and article disposition matrix
- [ia-implementation-plan.md](ia-implementation-plan.md) - phased roadmap for implementing the IA audit recommendations
- [CHANGELOG.md](CHANGELOG.md) - notable knowledge-base changes and updates
