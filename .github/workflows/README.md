# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Stream Deck RAG Documentation System.

## Available Workflows

### 1. Build Docusaurus Documentation (`build-docs.yml`)

**Purpose**: Builds the Docusaurus documentation site to ensure it compiles correctly.

**Triggers**:
- Push to `main` or `develop` branches (when doc-site or knowledge-base files change)
- Pull requests (when doc-site or knowledge-base files change)
- Manual trigger via workflow_dispatch

**Steps**:
1. Checkout repository
2. Setup Node.js 20
3. Install doc-site dependencies
4. Build Docusaurus site
5. Upload build artifact (retained for 7 days)

**Usage**:
- Automatically runs when documentation files are modified
- Can be manually triggered from the Actions tab in GitHub
- Build artifact can be downloaded from the workflow run page

### 2. Build MCP Server (`build-mcp-server.yml`)

**Purpose**: Builds the MCP server and updates the RAG vector database with latest documentation.

**Triggers**:
- Push to `main` or `develop` branches (when rag-system files change)
- Pull requests (when rag-system files change)
- Manual trigger via workflow_dispatch

**Steps**:
1. Checkout repository
2. Setup Node.js 20
3. Install root dependencies
4. Install doc-site dependencies (required for RAG ingestion)
5. **Update RAG vector database** (`npm run ingest`) - only if `GOOGLE_API_KEY` secret is set
6. Test MCP server loads without syntax errors
7. Upload RAG storage artifact (retained for 7 days)

**Configuration**:

To enable full RAG ingestion in CI/CD:
1. Go to repository Settings → Secrets and variables → Actions
2. Add a new repository secret: `GOOGLE_API_KEY`
3. Set the value to your Google API key

**Note**: If `GOOGLE_API_KEY` is not configured, the workflow will skip the ingestion step and display a warning.

**Usage**:
- Automatically validates MCP server changes
- Updates RAG database when documentation changes
- Can be manually triggered to rebuild the RAG index

## Existing Workflow

### Deploy Docusaurus to GitHub Pages (`deploy.yml`)

**Purpose**: Deploys the Docusaurus documentation site to GitHub Pages.

**Triggers**:
- Push to `main` branch
- Manual trigger via workflow_dispatch

This workflow builds and deploys the documentation site to be publicly accessible via GitHub Pages.

## Local Testing

You can test the workflows locally before pushing:

### Test Docusaurus Build
```bash
cd doc-site
npm install
npm run build
```

### Test MCP Server Build
```bash
# Install dependencies
npm install
cd doc-site && npm install && cd ..

# Optional: Update RAG database (requires GOOGLE_API_KEY in .env)
npm run ingest

# Test MCP server loads
npx tsx rag-system/server/mcpServer.ts
```

## Troubleshooting

### Build Docs Workflow Fails
- Check if doc-site dependencies are correctly specified in `doc-site/package.json`
- Verify Node.js version compatibility (requires Node 20+)
- Check Docusaurus build logs for specific errors

### Build MCP Server Workflow Fails
- Verify all dependencies are correctly installed
- If RAG ingestion fails, check `GOOGLE_API_KEY` secret is set correctly
- Check that rag-system TypeScript code is valid
- Ensure knowledge-base markdown files are properly formatted

## Contributing

When adding new workflows:
1. Test locally first
2. Use descriptive job and step names
3. Add appropriate triggers and path filters
4. Include artifact uploads for build outputs
5. Document the workflow in this README
