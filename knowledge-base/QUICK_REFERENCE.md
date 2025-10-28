# Quick Reference

Essential commands and code snippets for working with this repository.

## 📦 Installation

```bash
# Clone and install
git clone https://github.com/9h03n1x/rag-streamdeck-dev.git
cd rag-streamdeck-dev
npm install
cd doc-site && npm install && cd ..

# Configure API key
echo 'GOOGLE_API_KEY="your-key-here"' > .env
```

## 🚀 Common Commands

| Command | Description |
|---------|-------------|
| `npm run docs:start` | Start Docusaurus dev server |
| `npm run docs:build` | Build documentation site |
| `npm run ingest` | Build/rebuild RAG vector index |
| `npm run test:query` | Test RAG with sample query |
| `npm run mcp:server` | Start MCP server for LLM integration |

## 🤖 RAG System API

### MCP Server (Recommended for LLMs)

Start the Model Context Protocol server:

```bash
npm run mcp:server
```

Configure in Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "streamdeck-docs": {
      "command": "node",
      "args": ["--loader", "ts-node/esm", "/path/to/rag-streamdeck-dev/rag-system/server/mcpServer.ts"],
      "env": {
        "GOOGLE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Then ask Claude:
```
Use the streamdeck-docs tool to find out how to create a basic plugin
```

See [MCP_SERVER_GUIDE.md](../MCP_SERVER_GUIDE.md) for full setup instructions.

### Direct Query API

```typescript
import { query } from './rag-system/server/ragService';

const answer = await query("Your question here");
console.log(answer);
```

### Custom Query Script

```typescript
// src/scripts/customQuery.ts
import { query } from '../server/ragService';

async function main() {
  const questions = [
    "How do I create a plugin action?",
    "What is the Property Inspector?",
    "How do I debug a plugin?"
  ];

  for (const q of questions) {
    console.log(`\nQ: ${q}`);
    const answer = await query(q);
    console.log(`A: ${answer}\n`);
  }
}

main();
```

Run it:
```bash
npx ts-node src/scripts/customQuery.ts
```

## 📝 Adding Documentation

### Add a New Markdown File

```bash
# 1. Create file
echo "# My New Guide" > my-topic/new-guide.md

# 2. Add content
# Edit the file...

# 3. Rebuild RAG index
npm run ingest
```

### Add to Docusaurus Sidebar

Edit `doc-site/sidebars.ts`:

```typescript
module.exports = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'My Topic',
      items: ['my-topic/new-guide'],
    },
  ],
};
```

## 🔧 Configuration

### Gemini Models

Available models in `@llamaindex/google`:

```typescript
import { GEMINI_MODEL } from '@llamaindex/google';

// For LLM
GEMINI_MODEL.GEMINI_2_0_FLASH          // Fast, recommended
GEMINI_MODEL.GEMINI_2_0_PRO_EXPERIMENTAL // More capable
GEMINI_MODEL.GEMINI_PRO_1_5            // Stable

// For Embeddings
GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004  // Recommended
GEMINI_EMBEDDING_MODEL.EMBEDDING_001       // Legacy
```

### Adjust RAG Settings

```typescript
// src/server/ragService.ts

// Change number of retrieved chunks
queryEngine = index.asQueryEngine({
  similarityTopK: 10, // Default: 5
});

// Change LLM model
Settings.llm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_PRO_EXPERIMENTAL,
  temperature: 0.7, // Default: 0.1
});
```

## 🎨 Docusaurus Customization

### Change Theme Colors

Edit `doc-site/src/css/custom.css`:

```css
:root {
  --ifm-color-primary: #2e8555;
  --ifm-color-primary-dark: #29784c;
  /* ... */
}
```

### Add Custom Page

```bash
cd doc-site
mkdir -p src/pages
```

Create `src/pages/my-page.tsx`:

```tsx
import Layout from '@theme/Layout';

export default function MyPage() {
  return (
    <Layout title="My Page">
      <div style={{padding: '2rem'}}>
        <h1>Custom Page</h1>
        <p>Content here...</p>
      </div>
    </Layout>
  );
}
```

Visit at `/my-page`

## 🔍 Search Examples

### Filter by Topic

```typescript
const answer = await query("How to debug plugins?");
// Returns relevant debugging information
```

### Code Examples

```typescript
const answer = await query("Show me a basic action template");
// Returns code examples from code-templates/
```

### Troubleshooting

```typescript
const answer = await query("Plugin not appearing in Stream Deck");
// Returns relevant troubleshooting steps
```

## 📊 Project Statistics

```bash
# Count documentation files
find . -name "*.md" -not -path "*/node_modules/*" | wc -l

# Show storage size
du -sh storage/

# List all topics
find . -name "*.md" -not -path "*/node_modules/*" -exec basename {} \;
```

## 🐛 Debugging

### Enable Verbose Logging

```typescript
// src/server/ragService.ts
Settings.llm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_FLASH,
  apiKey: process.env.GOOGLE_API_KEY,
  // Add verbose logging
  verbose: true,
});
```

### Check Vector Index

```bash
# View index files
ls -lh storage/

# Check index content
cat storage/doc_store.json | head -n 20
```

### Test Embeddings

```typescript
import { GeminiEmbedding, GEMINI_EMBEDDING_MODEL } from '@llamaindex/google';

const embedModel = new GeminiEmbedding({
  model: GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004,
  apiKey: process.env.GOOGLE_API_KEY,
});

const embedding = await embedModel.getTextEmbedding("test text");
console.log(`Embedding dimensions: ${embedding.length}`);
```

## 📦 Building for Production

```bash
# Build documentation
cd doc-site
npm run build

# Test production build locally
npm run serve

# Build RAG index
cd ..
npm run ingest
```

## 🔐 Security Checklist

- [ ] `.env` in `.gitignore`
- [ ] `storage/` in `.gitignore`
- [ ] API keys not in code
- [ ] Dependencies updated
- [ ] No sensitive data in docs

## 📚 Useful Links

- [Docusaurus Docs](https://docusaurus.io/)
- [LlamaIndex.TS](https://ts.llamaindex.ai/)
- [Google AI Studio](https://aistudio.google.com/)
- [Stream Deck SDK](https://docs.elgato.com/streamdeck/sdk)

---

For more details, see [GETTING_STARTED.md](./GETTING_STARTED.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)
