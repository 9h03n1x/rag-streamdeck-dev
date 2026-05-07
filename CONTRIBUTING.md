# Contributing

This repository is a maintained markdown knowledge base. Keep changes small, structured, and directly useful to Stream Deck plugin developers.

## Content Principles

1. Put each topic in one canonical file.
2. Prefer concise explanations followed by working examples.
3. Use Stream Deck SDK v2 and Node.js 20+ patterns unless a document explicitly covers legacy migration.
4. Keep examples safe by default: no hardcoded secrets, no logging credentials, no unbounded timers or listeners.
5. Preserve user-facing troubleshooting details when replacing older docs.

## File Structure

- Use lowercase kebab-case file names, for example `settings-persistence.md`.
- Add new files under the most specific existing category in [knowledge-base/](knowledge-base/).
- Update [knowledge-base/INDEX.md](knowledge-base/INDEX.md) whenever files are added, moved, renamed, or removed.
- Do not add generated sites, vector stores, dependency folders, or build outputs.

## Markdown Style

- Start each document with a clear `#` heading, after optional frontmatter.
- Use `##` sections for major topics and `###` for details.
- Use fenced code blocks with language identifiers when possible.
- Prefer relative links to other markdown files.
- Keep link targets valid after moving files.
- Avoid placeholder sections such as "coming soon"; omit the section until it has useful content.

## Validation

Run this before committing:

```bash
npm test
```

The validator checks markdown headings, conflict markers, file names, and local markdown links.
