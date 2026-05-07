# Stream Deck Plugin Development Index

Use this file as the navigation hub for the markdown knowledge base. The repository focuses on maintained, canonical markdown files; generated sites, vector stores, and legacy archive trees are intentionally out of scope.

## Start Here

- [GETTING_STARTED.md](GETTING_STARTED.md) - fast orientation and first steps
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - compact command and API lookup
- [core-concepts/architecture-overview.md](core-concepts/architecture-overview.md) - how Stream Deck plugins are structured
- [examples/basic-counter-plugin.md](examples/basic-counter-plugin.md) - complete starter plugin walkthrough
- [troubleshooting/common-issues.md](troubleshooting/common-issues.md) - frequent setup, runtime, and UI issues

## Core Concepts

- [core-concepts/action-development.md](core-concepts/action-development.md) - `SingletonAction`, lifecycle events, render and interaction patterns
- [core-concepts/architecture-overview.md](core-concepts/architecture-overview.md) - runtime architecture and file layout
- [core-concepts/communication-protocol.md](core-concepts/communication-protocol.md) - plugin and Property Inspector communication
- [core-concepts/settings-persistence.md](core-concepts/settings-persistence.md) - action and global settings
- [core-concepts/stream-deck-plus-deep-dive.md](core-concepts/stream-deck-plus-deep-dive.md) - dials, touchstrip, layouts, and feedback

## Development Workflow

- [development-workflow/environment-setup.md](development-workflow/environment-setup.md) - tools, Node.js, Stream Deck CLI, editor setup
- [development-workflow/sdk-2-1-0-update-guide.md](development-workflow/sdk-2-1-0-update-guide.md) - mandatory SDK 2.1.0/new-plugin update baseline
- [development-workflow/build-and-deploy.md](development-workflow/build-and-deploy.md) - local builds, packaging, and installation
- [development-workflow/debugging-guide.md](development-workflow/debugging-guide.md) - logs, VS Code debugging, Chrome DevTools
- [development-workflow/testing-strategies.md](development-workflow/testing-strategies.md) - test design and SDK mocking
- [development-workflow/ci-cd-complete.md](development-workflow/ci-cd-complete.md) - automation patterns
- [development-workflow/localization.md](development-workflow/localization.md) - internationalization and translations

## UI Components

- [ui-components/property-inspector-basics.md](ui-components/property-inspector-basics.md) - Property Inspector setup and communication
- [ui-components/form-components.md](ui-components/form-components.md) - SDPI components and form patterns
- [advanced-topics/advanced-property-inspector.md](advanced-topics/advanced-property-inspector.md) - validation, wizards, tabs, state, accessibility

## Code Templates

- [code-templates/action-templates.md](code-templates/action-templates.md) - action class templates
- [code-templates/manifest-templates.md](code-templates/manifest-templates.md) - manifest examples
- [code-templates/property-inspector-templates.md](code-templates/property-inspector-templates.md) - PI templates
- [code-templates/common-patterns.md](code-templates/common-patterns.md) - reusable TypeScript patterns

## Advanced Topics

- [advanced-topics/analytics-and-telemetry.md](advanced-topics/analytics-and-telemetry.md) - privacy-conscious telemetry
- [advanced-topics/device-specific-development.md](advanced-topics/device-specific-development.md) - hardware-specific behavior
- [advanced-topics/managing-multiple-instances.md](advanced-topics/managing-multiple-instances.md) - instance state and coordination
- [advanced-topics/multi-action-coordination.md](advanced-topics/multi-action-coordination.md) - shared state and event bus patterns
- [advanced-topics/network-operations.md](advanced-topics/network-operations.md) - HTTP, WebSocket, caching, retries, offline mode
- [advanced-topics/oauth-implementation.md](advanced-topics/oauth-implementation.md) - OAuth flows for plugins
- [advanced-topics/performance-profiling.md](advanced-topics/performance-profiling.md) - memory, CPU, rendering, and network performance
- [advanced-topics/versioning-and-migrations.md](advanced-topics/versioning-and-migrations.md) - versions, settings migrations, rollback practices

## Reference

- [reference/api-reference.md](reference/api-reference.md) - Stream Deck SDK API reference
- [reference/cli-commands.md](reference/cli-commands.md) - Stream Deck CLI commands
- [reference/manifest-schema.md](reference/manifest-schema.md) - `manifest.json` schema reference
- [reference/sdk-2-1-0-github-audit.md](reference/sdk-2-1-0-github-audit.md) - latest upstream SDK comparison and KB gap notes
- [reference/sdk-source-code-guide.md](reference/sdk-source-code-guide.md) - official SDK source structure
- [reference/sdk-v1-to-v2-migration.md](reference/sdk-v1-to-v2-migration.md) - migration from legacy SDK patterns to v2

## Examples

- [examples/basic-counter-plugin.md](examples/basic-counter-plugin.md) - complete basic plugin
- [examples/calendar-dial-carousel.md](examples/calendar-dial-carousel.md) - dial carousel and display/interaction synchronization
- [examples/real-world-plugin-examples.md](examples/real-world-plugin-examples.md) - production-style examples and patterns

## Security, Marketplace, And Compliance

- [security-and-compliance/security-requirements.md](security-and-compliance/security-requirements.md) - security requirements and review checklist
- [plugin-secrets-management.md](plugin-secrets-management.md) - handling secrets in plugins
- [legal/compliance-guide.md](legal/compliance-guide.md) - compliance considerations
- [marketplace/approval-checklist.md](marketplace/approval-checklist.md) - release readiness checklist
- [marketplace/submission-guide.md](marketplace/submission-guide.md) - marketplace submission flow
- [profile-publish.md](profile-publish.md) - profile publishing notes

## Troubleshooting

- [troubleshooting/common-issues.md](troubleshooting/common-issues.md) - common setup, runtime, PI, and state bugs
- [troubleshooting/diagnostic-flowcharts.md](troubleshooting/diagnostic-flowcharts.md) - diagnostic decision trees

## Maintenance

- [../CONTRIBUTING.md](../CONTRIBUTING.md) - documentation style and contribution rules
- [CHANGELOG.md](CHANGELOG.md) - notable knowledge-base changes
