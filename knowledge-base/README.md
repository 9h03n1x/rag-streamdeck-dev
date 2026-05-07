# Knowledge Base

This folder is the canonical documentation source for Stream Deck plugin development. The content is plain markdown so it can be read directly in editors, indexed by external tools, or embedded as a low-noise submodule in plugin projects.

## Layout

- [core-concepts/](core-concepts/) - SDK architecture, actions, settings, communication, hardware concepts
- [development-workflow/](development-workflow/) - environment setup, build, deployment, debugging, testing, localization, CI/CD
- [ui-components/](ui-components/) - Property Inspector and SDPI component guidance
- [code-templates/](code-templates/) - reusable implementation templates
- [advanced-topics/](advanced-topics/) - OAuth, devices, networking, telemetry, performance, migrations
- [reference/](reference/) - API reference, CLI commands, SDK source guide, manifest schema, SDK migration notes
- [examples/](examples/) - complete plugin examples and real-world patterns
- [troubleshooting/](troubleshooting/) - common issues and diagnostic workflows
- [security-and-compliance/](security-and-compliance/) - security requirements and safe credential handling
- [legal/](legal/) and [marketplace/](marketplace/) - publishing, compliance, and marketplace guidance

Top-level files such as [GETTING_STARTED.md](GETTING_STARTED.md), [QUICK_REFERENCE.md](QUICK_REFERENCE.md), and [CHANGELOG.md](CHANGELOG.md) provide entry points and project history. For mandatory new-plugin and SDK update requirements, start with [development-workflow/sdk-2-1-0-update-guide.md](development-workflow/sdk-2-1-0-update-guide.md).

## Using This KB with AI Coding Agents

This knowledge base is designed to be retrieval-friendly for AI agents like Claude and GitHub Copilot. Here's how to use it effectively:

**Entry Points:**
- Start with [INDEX.md](INDEX.md) for a guided tour of all documentation by topic.
- Use [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for compact lookups.

**Scope and Source of Truth:**
- This KB explains *Stream Deck-specific* implementation guidance and patterns.
- For fast-changing details, the KB defers to official sources:
  - **SDK API & schemas**: Official [Elgato SDK docs](https://docs.elgato.com/streamdeck/sdk)
  - **SDPI components**: [SDPI Components documentation](https://sdpi-components.dev/)
  - **OAuth provider setup**: Each provider's developer dashboard and API docs
  - **CI/CD platform syntax**: GitHub Actions, GitLab, Azure DevOps, Jenkins official docs
  - **Legal & compliance**: Legal counsel and regulatory authorities, not this KB
  - **Marketplace policies**: [Official Elgato Marketplace](https://console.elgato.com)

**Common Agent Tasks:**
- **Bootstrap a new plugin**: Follow [GETTING_STARTED.md](GETTING_STARTED.md) → [core-concepts/architecture-overview.md](core-concepts/architecture-overview.md) → [examples/basic-counter-plugin.md](examples/basic-counter-plugin.md).
- **Adapt a code template**: Use [code-templates/](code-templates/) as a starting point, then customize for your use case.
- **Troubleshoot a failure**: Start with [troubleshooting/diagnostic-flowcharts.md](troubleshooting/diagnostic-flowcharts.md) to isolate the problem.
- **Review plugin structure**: Check [core-concepts/action-development.md](core-concepts/action-development.md) and [ui-components/property-inspector-basics.md](ui-components/property-inspector-basics.md) for best practices.
- **Implement a specific feature**: Search the KB for the feature (OAuth, dials, localization, performance) and follow the how-to article, then cite external sources for provider/platform details.

**Important Caveats:**
- Do not cite this KB for legal, compliance, or regulatory questions. Link users to legal counsel or official policy documents.
- Do not treat reference articles (API, schema, CLI) as authoritative without verifying against the official source.
- When the KB says "link to official docs," follow that guidance—it means the official source is the authority.

## Maintenance Rules

1. Keep each topic in one canonical file.
2. Move genuinely reusable content into the relevant category instead of adding duplicate guides.
3. Archive outside the repository if content is not maintained.
4. Prefer SDK v2.1.0, Node.js 24+, and Stream Deck 7.1+ examples for new plugin development.
5. Run `npm test` from the repository root after link or structure changes.
