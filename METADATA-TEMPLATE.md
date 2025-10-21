# Metadata Template for RAG Optimization

## YAML Frontmatter Template

Add this to the beginning of each markdown file:

```yaml
---
category: [category-name]
title: [Full File Title]
tags: [keyword1, keyword2, keyword3, ...]
difficulty: [beginner|intermediate|advanced|reference]
sdk-version: v2
related-files: [file1.md, file2.md, ...]
description: Brief description of content and purpose
---
```

## Category Classifications

| Category | Purpose | Files |
|----------|---------|-------|
| `core-concepts` | Fundamental knowledge | architecture, actions, settings, communication |
| `development-workflow` | Process and tools | setup, build, debug, test |
| `ui-components` | User interface | property inspector, forms |
| `code-templates` | Ready-to-use code | actions, manifests, UI, patterns |
| `security-and-compliance` | Security practices | security requirements |
| `reference` | API documentation | API reference, CLI commands |
| `examples` | Complete implementations | working plugins |
| `troubleshooting` | Problem solving | common issues, solutions |

## Tag Guidelines

### Primary Tags (Core Concepts)
- `architecture`, `nodejs`, `chromium`, `websocket`
- `action`, `singletonaction`, `events`, `lifecycle`
- `settings`, `persistence`, `security`
- `communication`, `protocol`, `messages`

### Development Tags
- `setup`, `environment`, `build`, `deploy`
- `debug`, `logging`, `testing`, `cicd`
- `vscode`, `chrome-devtools`, `cli`

### UI Tags
- `ui`, `property-inspector`, `forms`, `components`
- `html`, `css`, `javascript`, `sdpi-components`
- `validation`, `binding`, `styling`

### Implementation Tags  
- `templates`, `examples`, `patterns`
- `counter`, `toggle`, `api`, `dial`
- `manifest`, `configuration`, `metadata`

### Problem-Solving Tags
- `troubleshooting`, `issues`, `problems`, `solutions`
- `errors`, `debugging`, `fixes`

## Difficulty Levels

- **beginner**: Basic concepts, getting started
- **intermediate**: Implementation details, common patterns  
- **advanced**: Complex patterns, security, optimization
- **reference**: API documentation, command references

## Related Files Strategy

Link files that are:
- **Prerequisites**: Must be understood first
- **Dependencies**: Referenced or used together
- **Extensions**: Build upon concepts
- **Alternatives**: Different approaches to same goal

## Description Guidelines

Write 1-2 sentences that:
- Summarize the main purpose
- Mention key topics covered
- Indicate when to use this content

## Example Implementation

```yaml
---
category: core-concepts
title: Action Development
tags: [action, singletonaction, events, lifecycle, keydown, keyup]
difficulty: intermediate
sdk-version: v2
related-files: [settings-persistence.md, architecture-overview.md, communication-protocol.md]
description: Comprehensive guide to developing Stream Deck actions with event handling and lifecycle management
---
```

## Benefits for RAG Systems

1. **Enhanced Retrieval**: Tags and categories improve semantic matching
2. **Content Filtering**: Filter by difficulty, category, or SDK version
3. **Relationship Mapping**: Related files create knowledge graphs
4. **Quality Control**: Consistent structure improves AI responses
5. **Version Management**: Track SDK version compatibility

## Implementation Checklist

- [ ] Add frontmatter to all 22 files
- [ ] Use consistent category names
- [ ] Include relevant tags for each file
- [ ] Set appropriate difficulty levels
- [ ] Link related files bidirectionally
- [ ] Write clear, concise descriptions
- [ ] Verify metadata accuracy

This metadata structure will significantly improve RAG retrieval accuracy and enable sophisticated filtering and relationship mapping in AI systems.