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

Top-level files such as [GETTING_STARTED.md](GETTING_STARTED.md), [QUICK_REFERENCE.md](QUICK_REFERENCE.md), and [CHANGELOG.md](CHANGELOG.md) provide entry points and project history.

## Maintenance Rules

1. Keep each topic in one canonical file.
2. Move genuinely reusable content into the relevant category instead of adding duplicate guides.
3. Archive outside the repository if content is not maintained.
4. Prefer SDK v2 and Node.js 20+ examples.
5. Run `npm test` from the repository root after link or structure changes.
