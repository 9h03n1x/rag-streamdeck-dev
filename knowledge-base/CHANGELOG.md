# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-10-27

### 🚀 Major Release: Interactive Documentation & AI-Powered RAG System

This release transforms the repository from a static documentation collection into an interactive, AI-powered knowledge base with a modern documentation website.

### Added

#### Documentation Site
- **Docusaurus Integration**: Modern, searchable documentation website
  - React-based UI with responsive design
  - Dark mode support
  - Mobile-friendly layout
  - Fast static site generation
- **Automatic API Documentation**: TypeDoc integration for auto-generated API references
- **Interactive Navigation**: Sidebar navigation with category organization
- **Search Functionality**: Built-in documentation search
- **Deployment Ready**: Pre-configured for GitHub Pages, Vercel, Netlify

#### RAG System
- **AI-Powered Query System**: Google Gemini-based RAG implementation
  - Semantic search across all 64+ documentation files
  - Context-aware answers to natural language questions
  - Embedding-based retrieval with `text-embedding-004`
  - LLM responses with `gemini-2.0-flash`
- **Vector Index Storage**: Persistent local storage for embeddings
- **Query Service API**: Programmatic access to documentation knowledge
- **Ingestion Pipeline**: Automated document processing and indexing

#### Developer Tools
- **npm Scripts**: Convenient commands for all operations
  - `npm run docs:start` - Start documentation server
  - `npm run docs:build` - Build production site
  - `npm run ingest` - Build RAG knowledge base
  - `npm run test:query` - Test RAG system
- **TypeScript Support**: Full TypeScript implementation for RAG system
- **Environment Configuration**: `.env` file for API key management
- **Git Ignore Rules**: Protected secrets and generated files

#### Documentation
- **GETTING_STARTED.md**: Comprehensive setup and usage guide
- **DEPLOYMENT.md**: Multi-platform deployment instructions
- **QUICK_REFERENCE.md**: Command and API quick reference
- **Updated README.md**: Enhanced with RAG system documentation
- **docusaurus.md**: Original implementation plan

#### Project Structure
- `doc-site/`: Docusaurus documentation website
- `src/`: TypeScript RAG system implementation
  - `src/scripts/`: Ingestion and test scripts
  - `src/server/`: Query service
- `storage/`: Vector index storage (gitignored)
- `.env`: API key configuration (gitignored)

### Changed
- **README.md**: Restructured with Quick Start section and RAG documentation
- **Project Version**: Bumped to 2.0.0
- **Repository Purpose**: Expanded from documentation to full-stack knowledge system

### Technical Details

#### Dependencies Added
- `llamaindex` - Core RAG framework
- `@llamaindex/google` - Google Gemini integration
- `dotenv` - Environment variable management
- `ts-node` - TypeScript execution
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `docusaurus` - Documentation site framework
- `docusaurus-plugin-typedoc` - API doc generation

#### Architecture
- **Frontend**: Docusaurus (React + MDX)
- **Backend**: LlamaIndex.ts + Google Gemini
- **Storage**: Local JSON-based vector store
- **Language**: TypeScript throughout

#### Performance
- Vector index: ~64 documents processed
- Embedding model: `text-embedding-004` (768 dimensions)
- LLM: `gemini-2.0-flash` (fast inference)
- Storage: ~5-10MB for complete index

### Security
- API keys stored in `.env` (gitignored)
- Vector storage excluded from git
- No sensitive data in public documentation
- Secure Gemini API authentication

### Deployment
- GitHub Pages workflow ready
- Vercel/Netlify compatible
- Docker configuration available
- Self-hosting guide included

### Breaking Changes
None - this is a feature addition. All existing documentation remains unchanged and accessible.

### Migration Guide
No migration needed for existing users. New features are opt-in:
1. Install dependencies: `npm install`
2. Add API key to `.env`
3. Run `npm run ingest` to build RAG index
4. Start using with `npm run test:query`

### Known Issues
None identified. Please report issues on GitHub.

### Contributors
- Initial RAG implementation: GitHub Copilot
- Documentation structure: Original repository maintainer

---

## [1.0.0] - 2025-10-01

### Initial Release
- Comprehensive Stream Deck plugin documentation
- Organized into logical categories
- 60+ markdown files covering:
  - Core concepts
  - Development workflows
  - UI components
  - Code templates
  - Security guidelines
  - API references
  - Real-world examples

---

## Version Naming

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes or significant new capabilities
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, documentation updates

## Upgrade Instructions

### From 1.x to 2.0

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Install new dependencies**
   ```bash
   npm install
   cd doc-site && npm install
   ```

3. **Configure environment**
   ```bash
   echo 'GOOGLE_API_KEY="your-key"' > .env
   ```

4. **Build knowledge base**
   ```bash
   npm run ingest
   ```

5. **Start using new features**
   ```bash
   npm run docs:start  # Documentation site
   npm run test:query  # RAG system
   ```

---

For questions or issues, please open an issue on GitHub.
