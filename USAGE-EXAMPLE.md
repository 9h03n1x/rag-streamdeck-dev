# Using This RAG in Your Stream Deck Plugin Project

## Quick Start

### 1. Add RAG as Submodule

In your Stream Deck plugin project root:

```bash
# Add the RAG repository as a submodule
git submodule add https://github.com/9h03n1x/rag-streamdeck-dev.git .rag

# Initialize and update
git submodule update --init --recursive
```

Your project structure will now look like:

```
YourPlugin.sdPlugin/
├── .rag/                    # RAG documentation (this repository)
│   ├── README.md
│   └── docs/
│       ├── INDEX.md
│       ├── AI-AGENT-GUIDE.md
│       ├── api/
│       ├── guides/
│       ├── examples/
│       ├── schemas/
│       └── troubleshooting/
├── manifest.json
├── plugin.js
├── propertyinspector/
└── images/
```

### 2. Update Submodule (Get Latest Documentation)

```bash
# Update to latest version
git submodule update --remote .rag
```

### 3. Clone Project with Submodule

For other developers cloning your project:

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/yourname/your-plugin.git

# Or if already cloned
git submodule update --init --recursive
```

## For AI Agents

When an AI agent works on your project with this RAG submodule:

1. **The agent will find documentation in `.rag/docs/`**
2. **Agent should start with `.rag/docs/INDEX.md`** for navigation
3. **Agent should read `.rag/docs/AI-AGENT-GUIDE.md`** for usage instructions

### Example AI Agent Prompt

```
I'm working on a Stream Deck plugin project. The project includes a RAG 
documentation repository in the .rag/ directory.

Please use the documentation in .rag/docs/ to help me:
[Your specific request]

Start by reviewing .rag/docs/INDEX.md and .rag/docs/AI-AGENT-GUIDE.md
```

## Benefits

### For Developers

1. **Always up-to-date documentation** - Pull latest with `git submodule update --remote`
2. **Consistent across projects** - Same documentation in all your plugins
3. **Offline access** - Documentation is local
4. **Version controlled** - Lock to specific documentation version if needed

### For AI Agents

1. **Complete context** - Full Stream Deck API and best practices
2. **Code examples** - Working examples to reference
3. **Troubleshooting** - Common issues and solutions
4. **Quick navigation** - INDEX.md provides fast lookup

## Documentation Access

From your plugin project, reference documentation like:

```javascript
// In your code comments, reference the RAG
// See .rag/docs/api/streamdeck-api.md for setTitle documentation

// For developers reading your code
// Property inspector setup: See .rag/docs/guides/plugin-structure.md#property-inspector
```

## Git Ignore

Add this to your `.gitignore` if you don't want to track submodule updates:

```gitignore
# Don't track RAG submodule updates
.rag
```

Or commit the submodule reference (recommended):

```bash
# Commit the submodule
git add .rag .gitmodules
git commit -m "Add RAG documentation submodule"
```

## Updating Your Plugin with RAG Help

### Example Workflow

1. **Start development**:
   ```bash
   git submodule update --init --recursive
   ```

2. **Reference documentation** as you code:
   - Check `.rag/docs/api/streamdeck-api.md` for API methods
   - Use `.rag/docs/examples/` for code patterns
   - Follow `.rag/docs/guides/best-practices.md`

3. **Debug issues**:
   - Check `.rag/docs/troubleshooting/common-issues.md`

4. **Use with AI**:
   ```
   Please review my plugin code and compare it against best practices 
   in .rag/docs/guides/best-practices.md
   ```

## Project Configuration

### package.json Example

```json
{
  "name": "my-streamdeck-plugin",
  "version": "1.0.0",
  "description": "My Stream Deck plugin with RAG documentation",
  "scripts": {
    "update-docs": "git submodule update --remote .rag",
    "docs": "echo 'Documentation: .rag/docs/INDEX.md'"
  }
}
```

### README.md Example

```markdown
# My Stream Deck Plugin

## Development

This project includes comprehensive Stream Deck development documentation in the `.rag/` directory.

### Quick Links
- [Getting Started](.rag/docs/guides/getting-started.md)
- [API Reference](.rag/docs/api/streamdeck-api.md)
- [Troubleshooting](.rag/docs/troubleshooting/common-issues.md)

### For AI Agents
AI agents should reference `.rag/docs/AI-AGENT-GUIDE.md` for instructions on using the documentation.
```

## Advanced Usage

### Lock to Specific Version

```bash
# Update to specific version
cd .rag
git checkout v1.0.0
cd ..
git add .rag
git commit -m "Lock RAG to v1.0.0"
```

### Multiple Projects Sharing RAG

All your Stream Deck plugin projects can share the same RAG:

```
Projects/
├── plugin-1/
│   └── .rag/ → rag-streamdeck-dev
├── plugin-2/
│   └── .rag/ → rag-streamdeck-dev
└── plugin-3/
    └── .rag/ → rag-streamdeck-dev
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Plugin
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive  # Include RAG
      
      - name: Validate against docs
        run: |
          # Check manifest against schema
          # Lint code against best practices
          # etc.
```

## FAQ

### Q: Do I need to commit the .rag directory?
**A:** Commit `.gitmodules` and the submodule reference, but the content is tracked separately.

### Q: How do I update the documentation?
**A:** Run `git submodule update --remote .rag`

### Q: Can I modify the documentation?
**A:** For project-specific notes, create a separate `docs/` directory. The `.rag/` directory should remain as-is to receive updates.

### Q: What if I don't want automatic updates?
**A:** Don't run `--remote` flag. The submodule will stay at the committed version.

### Q: How do AI agents find this documentation?
**A:** Most AI agents automatically scan subdirectories. Point them to `.rag/docs/INDEX.md` in your prompt.

## Support

For issues with the RAG documentation:
- Open an issue at: https://github.com/9h03n1x/rag-streamdeck-dev/issues

For issues with your plugin:
- Reference troubleshooting: `.rag/docs/troubleshooting/common-issues.md`

## License

The RAG documentation is provided as-is for development assistance.
Your plugin code remains under your chosen license.
