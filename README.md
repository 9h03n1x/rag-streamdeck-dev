# Stream Deck Plugin Development Knowledge Base

A practical, markdown-first knowledge base for building Stream Deck plugins with SDK 2.1.0+. Learn architecture, build workflows, integrate third-party services, and ship to marketplace—all in one focused resource.

**New to Stream Deck plugins?** Start here: [knowledge-base/GETTING_STARTED.md](knowledge-base/GETTING_STARTED.md)

**Looking for specific guidance?** Browse by topic: [knowledge-base/INDEX.md](knowledge-base/INDEX.md)

---

## Why This Repository

This KB is designed to be:

- **Practical**: Real code examples, tested patterns, and actionable troubleshooting paths.
- **Lightweight**: Plain markdown in one folder. No hosted site, vector DB, or generated artifacts to maintain.
- **Canonical**: Source of truth for Stream Deck-specific implementation guidance. Official docs remain authoritative for SDK APIs, marketplace policies, and legal/compliance.
- **Agent-friendly**: Retrieval-ready for AI coding assistants and easy to embed in plugin projects as a submodule.
- **Organized by workflow**: Lifecycle-based IA (start → learn → build → design UI → integrate & secure → ship) designed for new developers.

## Get Started In 3 Ways

### I'm a new plugin developer

1. Clone or submodule this repo.
2. Read [knowledge-base/GETTING_STARTED.md](knowledge-base/GETTING_STARTED.md).
3. Follow the suggested reading path for new developers.

```bash
git clone https://github.com/9h03n1x/rag-streamdeck-dev.git
cd rag-streamdeck-dev && npm test
```

### I'm building an existing plugin or want a quick lookup

- **[Index & Navigation](knowledge-base/INDEX.md)** – browse all docs by topic.
- **[Quick Reference](knowledge-base/QUICK_REFERENCE.md)** – compact command and API lookup.
- **[Common Issues](knowledge-base/troubleshooting/common-issues.md)** – symptom-based fixes.

### I'm an AI coding agent (Claude, Copilot, etc.)

- See [knowledge-base/README.md](knowledge-base/README.md) for **Using This KB with AI Coding Agents**.
- Start with [knowledge-base/INDEX.md](knowledge-base/INDEX.md) for structured content.
- Use [knowledge-base/QUICK_REFERENCE.md](knowledge-base/QUICK_REFERENCE.md) for rapid lookups.

---

## What's Inside

| Category | Purpose | Key Articles |
| --- | --- | --- |
| **Learn** | Core concepts | [Architecture](knowledge-base/core-concepts/architecture-overview.md), [Actions](knowledge-base/core-concepts/action-development.md), [Settings](knowledge-base/core-concepts/settings-persistence.md), [Stream Deck +](knowledge-base/core-concepts/stream-deck-plus-deep-dive.md) |
| **Build** | Development workflow | [Setup](knowledge-base/development-workflow/environment-setup.md), [Build & Deploy](knowledge-base/development-workflow/build-and-deploy.md), [Debug](knowledge-base/development-workflow/debugging-guide.md), [Test](knowledge-base/development-workflow/testing-strategies.md) |
| **Design UI** | User interfaces | [Property Inspector Basics](knowledge-base/ui-components/property-inspector-basics.md), [SDPI Components](knowledge-base/ui-components/form-components.md), [Advanced PI](knowledge-base/advanced-topics/advanced-property-inspector.md) |
| **Integrate** | Advanced features | [OAuth](knowledge-base/advanced-topics/oauth-implementation.md), [Network Ops](knowledge-base/advanced-topics/network-operations.md), [Secrets](knowledge-base/security-and-compliance/secrets-management.md), [Telemetry](knowledge-base/advanced-topics/analytics-and-telemetry.md) |
| **Ship** | Release & marketplace | [Submission](knowledge-base/marketplace/submission-guide.md), [Checklist](knowledge-base/marketplace/approval-checklist.md), [Compliance](knowledge-base/legal/compliance-guide.md) |
| **Reference** | Lookup & source mapping | [API](knowledge-base/reference/api-reference.md), [Manifest](knowledge-base/reference/manifest-schema.md), [CLI](knowledge-base/reference/cli-commands.md), [Source Code Map](knowledge-base/reference/sdk-source-code-guide.md) |
| **Examples** | Complete code samples | [Basic Counter](knowledge-base/examples/basic-counter-plugin.md), [Dial UI](knowledge-base/examples/calendar-dial-carousel.md), [Real-World Scenarios](knowledge-base/examples/real-world-plugin-examples.md) |
| **Troubleshoot** | Problem solving | [Common Issues](knowledge-base/troubleshooting/common-issues.md), [Diagnostic Flows](knowledge-base/troubleshooting/diagnostic-flowcharts.md) |

---

## Using As A Submodule

Embed this KB in your plugin project:

```bash
git submodule add https://github.com/9h03n1x/rag-streamdeck-dev.git .streamdeck-kb
git submodule update --init --recursive
```

Then reference docs from your README or CI/CD pipeline:

```markdown
For development setup, see `.streamdeck-kb/knowledge-base/development-workflow/environment-setup.md`.
```
```

---

## What's Canonical vs. External

**We maintain locally:**
- Stream Deck-specific implementation patterns and best practices.
- Code templates and examples for actions, manifests, Property Inspector.
- Troubleshooting workflows and diagnostic guides.
- Integration patterns (OAuth, networking, secrets, telemetry).
- Marketplace submission and compliance checklists.

**We link to official sources for:**
- [Elgato SDK API & docs](https://docs.elgato.com/streamdeck/sdk)
- [SDPI Components](https://sdpi-components.dev/)
- [Stream Deck Marketplace](https://console.elgato.com)
- OAuth provider dashboards (Google, Spotify, Twitch, GitHub, Discord)
- Legal, compliance, and accessibility standards
- CI/CD platforms (GitHub Actions, GitLab, Azure DevOps, Jenkins)

See [knowledge-base/information-architecture-audit.md](knowledge-base/information-architecture-audit.md) for the full content governance model.

---

## Contributing & Maintaining

- **Want to suggest a topic or fix?** See [CONTRIBUTING.md](CONTRIBUTING.md).
- **Structural changes?** See [knowledge-base/ia-implementation-plan.md](knowledge-base/ia-implementation-plan.md).
- **Review history?** See [knowledge-base/CHANGELOG.md](knowledge-base/CHANGELOG.md).

All markdown is validated with `npm test` (checks headings, links, file names).

---

## Technical Baseline

This KB assumes:

- **SDK Version**: 2.1.0 or newer, SDK v3.
- **Node.js**: 24+ (Node.js 20 for legacy SDK v2 projects).
- **Stream Deck**: 7.1 or newer.
- **Build**: TypeScript, esbuild or webpack.

For older versions or SDK v1 migration, see [knowledge-base/reference/sdk-v1-to-v2-migration.md](knowledge-base/reference/sdk-v1-to-v2-migration.md).

---

## License

ISC
