# Quick Reference

Essential commands and navigation pointers for this markdown knowledge base.

## Repository Commands

| Command | Description |
|---------|-------------|
| `npm test` | Validate markdown structure and local links |
| `npm run validate:markdown` | Run the validator directly |
| `git submodule update --init --recursive` | Initialize this repo when used as a submodule |

## Entry Points

| Need | Start Here |
|------|------------|
| First orientation | [INDEX.md](INDEX.md) |
| New developer path | [GETTING_STARTED.md](GETTING_STARTED.md) |
| SDK API lookup | [reference/api-reference.md](reference/api-reference.md) |
| CLI lookup | [reference/cli-commands.md](reference/cli-commands.md) |
| Manifest fields | [reference/manifest-schema.md](reference/manifest-schema.md) |
| Starter plugin | [examples/basic-counter-plugin.md](examples/basic-counter-plugin.md) |
| Common failures | [troubleshooting/common-issues.md](troubleshooting/common-issues.md) |

## High-Value Topics

- Action lifecycle: [core-concepts/action-development.md](core-concepts/action-development.md)
- Settings: [core-concepts/settings-persistence.md](core-concepts/settings-persistence.md)
- Property Inspector: [ui-components/property-inspector-basics.md](ui-components/property-inspector-basics.md)
- Stream Deck +: [core-concepts/stream-deck-plus-deep-dive.md](core-concepts/stream-deck-plus-deep-dive.md)
- Network operations: [advanced-topics/network-operations.md](advanced-topics/network-operations.md)
- Performance: [advanced-topics/performance-profiling.md](advanced-topics/performance-profiling.md)
- SDK v1 to v2 migration: [reference/sdk-v1-to-v2-migration.md](reference/sdk-v1-to-v2-migration.md)

## Adding Or Editing Docs

```bash
# After editing markdown
npm test
```

Maintenance checklist:

1. Keep each topic in one canonical file.
2. Prefer practical code examples and checklists.
3. Use relative markdown links.
4. Update [INDEX.md](INDEX.md) for navigation changes.
5. Do not add generated sites, vector stores, dependency folders, or plugin build artifacts.
