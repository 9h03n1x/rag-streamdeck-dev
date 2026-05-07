# Changelog

All notable knowledge-base changes are documented here.

## Unreleased

### Added

- **Icon Design Specification** – [ui-components/icon-design-specification.md](ui-components/icon-design-specification.md):
  - Canvas and safe area rules (144×144 px master, 120×120 px live area, 12 px margin)
  - Glyph sizing guidelines (60–70% of live area, roughly 72–84 px effective)
  - SVG structure and visual style rules (flat fills, no gradients/shadows)
  - State design patterns (muted, active, recording, locked, busy)
  - Base SVG template with color values and rounded corners
  - Accessibility rules (shape-based state variants, not color-only)
  - Icon checklist and visual examples
- **CLAUDE.md Template** – [code-templates/claude-md-template.md](code-templates/claude-md-template.md):
  - Customizable template for Stream Deck plugin projects
  - Covers project context, SDK constraints, manifest rules, icon design, PI rules, common commands, testing checklist
  - Designed to be read automatically by Claude Code at session start
  - Prevents repeat mistakes across coding sessions
- **AI Tools Articles** – Comprehensive guides for Claude Desktop and GitHub Copilot integration:
  - [claude-desktop-getting-started.md](ai-tools/claude-desktop-getting-started.md) – Installation, projects, file uploads, and effective prompting.
  - [claude-desktop-mcp-streamdeck.md](ai-tools/claude-desktop-mcp-streamdeck.md) – Model Context Protocol configuration for filesystem access.
  - [copilot-vscode-getting-started.md](ai-tools/copilot-vscode-getting-started.md) – VS Code setup with custom instructions and Copilot Edits.
  - [copilot-agents-and-prompts.md](ai-tools/copilot-agents-and-prompts.md) – All built-in agents, slash commands, and ready-to-use prompt templates.
  - [agent-spec-driven-development.md](ai-tools/agent-spec-driven-development.md) – Three-phase methodology: spec → failing tests → agent implementation.
- **Article Quality Contract** – All KB articles now include (1) practical code example, (2) applicable Mermaid diagram, (3) Agent Prompt section.
- **Enhanced Markdown Validator** – Extended `scripts/validate-markdown.mjs` to enforce:
  - Presence of non-mermaid fenced code blocks (TypeScript, JSON, bash, config, etc.).
  - Presence of `## Agent Prompt` section with AI-specific guidance.
  - Presence of `## Diagram` section with Mermaid (except CHANGELOG.md).
  - Windows (CRLF) and Unix (LF) line-ending compatibility.

### Changed

- **Knowledge Base Migration** – All 57 KB articles updated to comply with article quality contract:
  - Added practical code/config examples contextual to each topic (TypeScript actions, manifest JSON, property inspector HTML/CSS, shell commands, checklists).
  - Added Mermaid diagrams (architecture, workflows, lifecycle, decision trees, reference tables).
  - Added `## Agent Prompt` sections with GitHub Copilot and Claude Desktop guidance.
- Repositioned the repository as a markdown-first Stream Deck plugin development knowledge base.
- Rewrote [INDEX.md](INDEX.md), [README.md](README.md), [GETTING_STARTED.md](GETTING_STARTED.md), and [QUICK_REFERENCE.md](QUICK_REFERENCE.md) around direct markdown use.
- Updated top-level [../README.md](../README.md) with visual lifecycle diagram and streamlined "Get Started" paths.
- Updated [CONTRIBUTING.md](../CONTRIBUTING.md) to document article quality contract and content standards.
- Added a lightweight markdown validation workflow and local `npm test` command.
- Preserved the manifest schema reference under [reference/manifest-schema.md](reference/manifest-schema.md).

### Fixed

- Fixed GitHub rendering error in [core-concepts/action-development.md](core-concepts/action-development.md) (removed 4-space indentation from subsection).
- Fixed validator regex for Windows CRLF line-ending handling.

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
