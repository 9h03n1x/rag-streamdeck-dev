# Changelog

All notable knowledge-base changes are documented here.

## Unreleased

### Changed

- Repositioned the repository as a markdown-first Stream Deck plugin development knowledge base.
- Rewrote [INDEX.md](INDEX.md), [README.md](README.md), [GETTING_STARTED.md](GETTING_STARTED.md), and [QUICK_REFERENCE.md](QUICK_REFERENCE.md) around direct markdown use.
- Added a lightweight markdown validation workflow and local `npm test` command.
- Preserved the manifest schema reference under [reference/manifest-schema.md](reference/manifest-schema.md).

### Removed

- Removed inactive hosted documentation site files.
- Removed inactive vector-query and MCP server implementation files.
- Removed duplicated legacy `docs/` and `_archive/` trees.
- Removed stale project-plan, generated-report, and hosted-site deployment documents.

## 2.0.0 - 2025-10-27

### Added

- Expanded the documentation collection with broader Stream Deck plugin development coverage.
- Added advanced topics, examples, reference material, troubleshooting, security, marketplace, and workflow guidance.

## 1.0.0 - 2025-10-01

### Added

- Initial Stream Deck plugin development documentation collection.

---

## Code Example

Use concise entries that name the user-visible documentation change and link the updated article when useful.

```markdown
## 2026-05-07

- Added [ai-tools/agent-spec-driven-development.md](ai-tools/agent-spec-driven-development.md) to document the spec-first, test-driven agent workflow.
- Updated the article quality contract to require practical examples, applicable diagrams, and agent prompts.
```

---

## Agent Prompt

Use this prompt with GitHub Copilot in VS Code or Claude Desktop after attaching the relevant plugin files.

```text
#file:knowledge-base/CHANGELOG.md
Use this article as the source of truth for my Stream Deck plugin.

Explain the key points from "Changelog" in practical terms. Then inspect my local plugin files for the same concept, identify any gaps or risky assumptions, and propose a spec-first, test-driven implementation plan before changing code.
```
