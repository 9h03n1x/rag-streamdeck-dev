# Stream Deck Plugin Development Knowledge Base

This repository is a markdown-first knowledge base for Stream Deck plugin development. It is designed to be useful as a lightweight reference repo, submodule, or AI-agent context source without carrying a hosted documentation site, vector database, or generated build artifacts.

## What Belongs Here

The canonical content lives in [knowledge-base/](knowledge-base/). Documents should be practical, well-structured, and easy to quote or search directly from markdown.

Primary categories:

- [knowledge-base/core-concepts/](knowledge-base/core-concepts/) - architecture, actions, settings, communication, Stream Deck + fundamentals
- [knowledge-base/development-workflow/](knowledge-base/development-workflow/) - setup, build, debugging, testing, CI/CD, localization
- [knowledge-base/ui-components/](knowledge-base/ui-components/) - Property Inspector and SDPI component patterns
- [knowledge-base/code-templates/](knowledge-base/code-templates/) - reusable action, manifest, PI, and implementation templates
- [knowledge-base/advanced-topics/](knowledge-base/advanced-topics/) - OAuth, devices, network operations, performance, migrations, telemetry
- [knowledge-base/reference/](knowledge-base/reference/) - API, CLI, SDK source, manifest schema, migration references
- [knowledge-base/examples/](knowledge-base/examples/) - complete examples and real-world patterns
- [knowledge-base/troubleshooting/](knowledge-base/troubleshooting/) - common issues and diagnostics
- [knowledge-base/security-and-compliance/](knowledge-base/security-and-compliance/), [knowledge-base/legal/](knowledge-base/legal/), and [knowledge-base/marketplace/](knowledge-base/marketplace/) - security, compliance, and publishing guidance

## What Does Not Belong Here

This repository intentionally avoids generated or runtime-heavy artifacts:

- No Docusaurus or hosted documentation build output
- No RAG/vector database storage
- No MCP server implementation
- No duplicated archive trees
- No plugin build artifacts

If a future consumer needs a website or vector index, build it outside this repository from the markdown source.

## Quick Start

Clone or add the repository as a submodule, then read directly from [knowledge-base/INDEX.md](knowledge-base/INDEX.md):

```bash
git clone https://github.com/9h03n1x/rag-streamdeck-dev.git
cd rag-streamdeck-dev
npm test
```

The validation step uses only Node.js built-ins and checks markdown structure plus local markdown links.

## Using As A Submodule

```bash
git submodule add https://github.com/9h03n1x/rag-streamdeck-dev.git .streamdeck-kb
git submodule update --init --recursive
```

For agent-assisted development, start with [knowledge-base/INDEX.md](knowledge-base/INDEX.md), then follow links into the task-specific category.

## Editing Guidelines

Use [CONTRIBUTING.md](CONTRIBUTING.md) for structure and style rules. In short:

- Keep one canonical location for each topic.
- Prefer practical examples over broad prose.
- Use relative links between markdown files.
- Update [knowledge-base/INDEX.md](knowledge-base/INDEX.md) whenever adding, moving, or removing docs.
- Run `npm test` before committing.

## License

ISC
