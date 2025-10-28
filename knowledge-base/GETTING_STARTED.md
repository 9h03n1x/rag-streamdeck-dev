# Getting Started with RAG-StreamDeck-Dev

This guide will help you set up and use both the documentation site and the AI-powered RAG system.

## Prerequisites

- Node.js 20+ installed
- A Google Gemini API key (free tier available)
- Git installed

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/9h03n1x/rag-streamdeck-dev.git
cd rag-streamdeck-dev
```

### 2. Install Dependencies

Install root dependencies:
```bash
npm install
```

Install Docusaurus dependencies:
```bash
cd doc-site
npm install
cd ..
```

### 3. Configure Your API Key

1. Get your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a `.env` file in the project root:
   ```bash
   GOOGLE_API_KEY="your-api-key-here"
   ```

## Using the Documentation Site

### Start the Development Server

```bash
npm run docs:start
```

The site will be available at `http://localhost:3000/rag-streamdeck-dev/`

### Build for Production

```bash
npm run docs:build
```

The static site will be generated in `doc-site/build/`

## Using the RAG System

### Build the Knowledge Base

First time setup - index all documentation:

```bash
npm run ingest
```

This will:
- Read all 64+ markdown files
- Generate embeddings using Gemini
- Create a vector index in `./storage/`
- Takes ~1-2 minutes depending on your API rate limits

### Query the Documentation

Test with the sample query:

```bash
npm run test:query
```

### Programmatic Usage

Use in your own code:

```typescript
import { query } from './src/server/ragService';

async function askQuestion() {
  const answer = await query("How do I create a Stream Deck plugin action?");
  console.log(answer);
}

askQuestion();
```

### Custom Queries

Edit `src/scripts/testQuery.ts` to ask different questions:

```typescript
const question = "What is the Property Inspector and how do I use it?";
```

## Project Structure

```
rag-streamdeck-dev/
├── doc-site/              # Docusaurus documentation website
│   ├── docs/             # Documentation markdown files
│   ├── src/              # React components and CSS
│   └── docusaurus.config.ts
│
├── src/                   # RAG system TypeScript code
│   ├── scripts/
│   │   ├── ingest.ts     # Builds vector index
│   │   └── testQuery.ts  # Test queries
│   └── server/
│       └── ragService.ts # Query engine
│
├── storage/               # Vector index (auto-generated)
├── core-concepts/         # Documentation markdown files
├── development-workflow/
├── ui-components/
└── ...                    # More documentation folders
```

## Workflow Examples

### For Documentation Authors

1. Add new markdown files to appropriate folders
2. Run `npm run ingest` to update the RAG index
3. Test queries work correctly with `npm run test:query`
4. Commit changes (`.env` and `storage/` are gitignored)

### For AI Agent Integration

#### Option 1: MCP Server (Recommended)

Use the Model Context Protocol server for seamless LLM integration:

```bash
# Start the MCP server
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
> "Use the streamdeck-docs tool to find out how to create a basic plugin"

See [MCP_SERVER_GUIDE.md](../MCP_SERVER_GUIDE.md) for detailed setup.

#### Option 2: Direct API Integration

```typescript
import { query } from './rag-system/server/ragService';

// In your AI agent code
const userQuestion = "How do I debug a Stream Deck plugin?";
const context = await query(userQuestion);

// Use context in your LLM prompt
const prompt = `Based on this documentation: ${context}\n\nAnswer: ${userQuestion}`;
```

### For Plugin Developers

1. Browse the Docusaurus site for structured documentation
2. Use the MCP server with your AI assistant for instant answers
3. Use the RAG system directly for quick queries: `npm run test:query`
4. Reference code examples in the `examples/` and `code-templates/` folders

## Troubleshooting

### "Cannot find module 'llamaindex'"

Make sure you've installed dependencies:
```bash
npm install
```

### Ingestion Fails

1. Check your API key is set in `.env`
2. Verify you have internet connection
3. Check Gemini API quotas at [Google AI Studio](https://aistudio.google.com/)

### Docusaurus Site Won't Start

```bash
cd doc-site
npm install
npm start
```

### Query Returns Generic Answers

The RAG system needs to be re-indexed after documentation changes:
```bash
npm run ingest
```

## Advanced Usage

### Change the AI Model

Edit `src/server/ragService.ts`:

```typescript
Settings.llm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_FLASH, // Change this
  apiKey: process.env.GOOGLE_API_KEY,
});
```

### Adjust Search Relevance

In `src/server/ragService.ts`, modify:

```typescript
queryEngine = index.asQueryEngine({
  similarityTopK: 10, // Increase for more context (default: 5)
});
```

### Add Custom Documentation

1. Create new `.md` files in any folder
2. Run `npm run ingest` to index them
3. They'll automatically be searchable

## Next Steps

- Explore the [Core Concepts](./core-concepts/architecture-overview.md)
- Review [Real-World Examples](./examples/real-world-plugin-examples.md)
- Check out the [API Reference](./reference/api-reference.md)
- Join the [Marketplace Makers Discord](https://discord.gg/GehBUcu627)

## Support

For issues with:
- **This repository**: Open an issue on GitHub
- **Stream Deck SDK**: Visit [Elgato Support](https://help.elgato.com)
- **Gemini API**: Check [Google AI Studio](https://aistudio.google.com/)

---

Happy coding! 🚀
