# GitHub Actions Workflows

This repository intentionally runs a small markdown-only CI surface.

## Workflows

- `validate-markdown.yml` checks markdown structure and local markdown links under `knowledge-base/` plus the root project docs.

The repository no longer builds a Docusaurus site, MCP server, or RAG vector database. Downstream consumers can generate those artifacts outside this repository from the canonical markdown source.
