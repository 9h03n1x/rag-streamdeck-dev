# Stream Deck Plugin Development RAG

This repository contains a comprehensive knowledge base for Stream Deck plugin development, designed to be used as a git submodule in Stream Deck plugin projects to assist AI agents during coding.

## Purpose

This RAG (Retrieval-Augmented Generation) repository provides:
- Stream Deck SDK documentation and API references
- Best practices for plugin development
- Common patterns and code examples
- Troubleshooting guides
- Schema documentation

## Usage as a Submodule

To add this RAG to your Stream Deck plugin project:

```bash
# Add as a submodule
git submodule add https://github.com/9h03n1x/rag-streamdeck-dev.git .rag

# Initialize and update the submodule
git submodule update --init --recursive
```

## Structure

- **`docs/api/`** - Stream Deck API reference documentation
- **`docs/guides/`** - Development guides and best practices
- **`docs/examples/`** - Code examples and patterns
- **`docs/schemas/`** - JSON schema documentation for manifests and property inspectors
- **`docs/troubleshooting/`** - Common issues and solutions

## For AI Agents

When assisting with Stream Deck plugin development:
1. Reference the API documentation in `docs/api/` for SDK methods and events
2. Follow best practices outlined in `docs/guides/`
3. Use examples from `docs/examples/` as templates
4. Validate JSON structures against schemas in `docs/schemas/`
5. Check `docs/troubleshooting/` for common issues

## Contributing

To update this knowledge base:
1. Add new documentation in the appropriate `docs/` subdirectory
2. Keep documentation clear, concise, and example-focused
3. Update this README if adding new categories

## License

This documentation repository is provided as-is for development assistance.
