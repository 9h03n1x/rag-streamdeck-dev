# Stream Deck Plugin Development - RAG Documentation System

A comprehensive documentation and RAG (Retrieval-Augmented Generation) system for Stream Deck plugin development.

## Repository Structure

This repository is organized into three main areas:

### 📚 `knowledge-base/`
**Purpose**: All raw markdown documentation files

Contains the complete documentation knowledge base in markdown format, organized by topic:
- `advanced-topics/` - OAuth, multi-device patterns, performance optimization
- `core-concepts/` - Architecture, communication protocols, settings persistence
- `development-workflow/` - Build processes, debugging, testing, CI/CD
- `code-templates/` - Reusable code patterns and templates
- `examples/` - Real-world plugin examples
- `reference/` - API reference and SDK documentation
- `ui-components/` - Property Inspector guides
- `marketplace/` - Submission and approval guides
- `security-and-compliance/` - Security requirements and compliance
- `legal/` - Legal and compliance documentation
- `troubleshooting/` - Common issues and solutions
- `docs/` - Legacy documentation (being migrated)
- `_archive/` - Original reference files

### 📖 `doc-site/`
**Purpose**: Docusaurus documentation website

A fully-featured documentation website built with Docusaurus:
- Interactive documentation browser
- Search functionality
- API documentation with TypeDoc
- Version control for docs

**Commands**:
```bash
npm run docs:start  # Start development server
npm run docs:build  # Build production site
```

### 🤖 `rag-system/`
**Purpose**: RAG infrastructure and vector database

Contains the LlamaIndex-based RAG system for intelligent documentation querying:
- `storage/` - Vector database files (doc_store.json, index_store.json, vector_store.json)
- `scripts/` - Ingestion and query scripts
  - `ingest.ts` - Process markdown files into vector database
  - `testQuery.ts` - Test RAG query functionality
  - `testMultipleQueries.ts` - Test multiple queries at once
- `server/` - RAG service implementation
  - `ragService.ts` - Core RAG query engine
  - `mcpServer.ts` - Model Context Protocol server for LLM integration

**Commands**:
```bash
npm run ingest      # Ingest documentation into vector DB
npm run test:query  # Test RAG queries
```

## Setup

### Prerequisites
- Node.js 18+
- Google API key (for Gemini embeddings and LLM)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/9h03n1x/rag-streamdeck-dev.git
cd rag-streamdeck-dev
```

2. Install dependencies:
```bash
npm install
cd doc-site && npm install && cd ..
```

3. Configure environment:
```bash
# Create .env file in root directory
echo GOOGLE_API_KEY=your_api_key_here > .env
```

### Building the Vector Database

Ingest documentation into the RAG system:
```bash
npm run ingest
```

This processes all markdown files from:
- `knowledge-base/` (raw documentation)
- `doc-site/docs/` (Docusaurus documentation)

### Testing RAG Queries

```bash
# Test with a single question
npm run test:query

# Test with multiple questions
npx ts-node rag-system/scripts/testMultipleQueries.ts
```

### Using the MCP Server

The RAG system can be exposed as an MCP (Model Context Protocol) server for seamless LLM integration:

```bash
npm run mcp:server
```

**Configure in Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
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

See [MCP_SERVER_GUIDE.md](./MCP_SERVER_GUIDE.md) for detailed setup instructions.

## Technology Stack

- **Documentation**: Markdown, Docusaurus
- **RAG Engine**: LlamaIndex.ts
- **Vector Embeddings**: Google Gemini (text-embedding-004)
- **LLM**: Google Gemini 2.0 Flash
- **MCP Integration**: Model Context Protocol SDK
- **Language**: TypeScript
- **Runtime**: Node.js 20+

## Development Workflow

### Adding New Documentation

1. Add markdown files to appropriate directory in `knowledge-base/`
2. Re-ingest documentation: `npm run ingest`
3. Test queries to verify content is accessible

### Updating Documentation Site

1. Edit files in `doc-site/docs/`
2. Preview: `npm run docs:start`
3. Build: `npm run docs:build`
4. Re-ingest if RAG system should include changes: `npm run ingest`

### Querying Documentation

Use the RAG system to query documentation:

```typescript
import { query } from './rag-system/server/ragService';

const answer = await query("How do I create a basic Stream Deck plugin?");
console.log(answer);
```

## Project Goals

1. **Comprehensive Documentation**: Maintain complete, accurate documentation for Stream Deck plugin development
2. **Intelligent Retrieval**: Enable AI-powered documentation queries via RAG
3. **Developer Experience**: Provide both human-readable docs (Docusaurus) and AI-consumable knowledge (vector DB)
4. **Quality Assurance**: Ensure all documentation is tested, validated, and kept up-to-date

## Contributing

When adding new documentation:
- Place source markdown in `knowledge-base/` with proper categorization
- Follow existing documentation structure and style
- Include code examples where applicable
- Re-ingest documentation after major changes

## License

ISC
