# MCP Server for Stream Deck Documentation RAG

This project includes a **Model Context Protocol (MCP)** server that exposes the Stream Deck plugin development documentation RAG system as a tool for LLMs.

## 🎯 What is MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is an open standard developed by Anthropic that allows AI applications to connect to external data sources and tools in a standardized way.

With this MCP server, any MCP-compatible LLM client can query the comprehensive Stream Deck plugin development documentation directly!

## 🚀 Quick Start

### 1. Prerequisites

Make sure you have:
- Node.js 20+ installed
- Google API key configured in `.env`
- RAG system ingested (run `npm run ingest`)

### 2. Test the MCP Server

```bash
npm run mcp:server
```

The server will start and wait for MCP protocol messages on stdin/stdout.

## 🔧 Configuration

### Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "streamdeck-docs": {
      "command": "node",
      "args": [
        "--loader",
        "ts-node/esm",
        "/absolute/path/to/rag-streamdeck-dev/rag-system/server/mcpServer.ts"
      ],
      "env": {
        "GOOGLE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/rag-streamdeck-dev` with the actual absolute path to this repository.

### Cline (VS Code Extension)

Add to your Cline MCP settings:

```json
{
  "mcpServers": {
    "streamdeck-docs": {
      "command": "node",
      "args": [
        "--loader",
        "ts-node/esm",
        "E:/MyWorkspace/Elgato/rag-streamdeck-dev/rag-system/server/mcpServer.ts"
      ]
    }
  }
}
```

### Other MCP Clients

Any MCP-compatible client can use this server. The general pattern is:

```json
{
  "command": "node",
  "args": ["--loader", "ts-node/esm", "<path-to-mcpServer.ts>"]
}
```

## 📚 Available Tools

### `query_streamdeck_docs`

Query the comprehensive Stream Deck plugin development documentation.

**Input**:
- `question` (string, required): The question to ask about Stream Deck plugin development

**Output**:
- AI-generated answer based on the documentation corpus

**Example Questions**:
- "How do I create a basic Stream Deck plugin?"
- "What's the difference between action settings and global settings?"
- "How do I handle dial rotation events on Stream Deck+?"
- "How do I implement OAuth in my plugin?"
- "What are the best practices for debugging plugins?"

## 🎨 Usage Examples

Once configured in your MCP client, you can ask questions like:

### In Claude Desktop:

> "Use the streamdeck-docs tool to find out how to create a property inspector with custom forms"

Claude will automatically call the `query_streamdeck_docs` tool and provide you with a comprehensive answer from the documentation.

### In Cline:

> "Query the Stream Deck documentation about implementing OAuth"

Cline will use the MCP tool to retrieve relevant information and help you implement OAuth in your plugin.

## 🔍 What Documentation is Available?

The RAG system has access to **98 documentation files** covering:

- ✅ **Getting Started**: Environment setup, first plugin
- ✅ **Core Concepts**: Architecture, actions, settings, communication protocol
- ✅ **Development Guide**: Build, deploy, debug, test, localization, CI/CD
- ✅ **UI Components**: Property inspectors, form components
- ✅ **Code Templates**: Action templates, manifest templates, common patterns
- ✅ **Security**: Security requirements, compliance guide
- ✅ **Advanced Topics**: OAuth, Stream Deck+, performance, analytics, network operations
- ✅ **Troubleshooting**: Common issues, diagnostic flowcharts
- ✅ **API Reference**: Complete SDK API, CLI commands, source code guide
- ✅ **Examples**: Basic counter plugin, real-world examples

## 🛠️ Troubleshooting

### Server Won't Start

1. **Check Node.js version**: Must be 20+
   ```bash
   node --version
   ```

2. **Verify dependencies are installed**:
   ```bash
   npm install
   ```

3. **Check Google API key**:
   - Make sure `.env` file exists with `GOOGLE_API_KEY=your-key`
   - Or set it in the MCP client configuration

### "Cannot find module" Error

Make sure you're using the correct path to `mcpServer.ts` and that `ts-node` is installed:

```bash
npm install
```

### RAG Returns Generic Answers

The vector store needs to be built first:

```bash
npm run ingest
```

This processes all documentation files and creates the vector database.

### MCP Client Can't Connect

1. Check the absolute path in your MCP configuration
2. Verify the command and args are correct
3. Check the MCP client logs for error messages

## 🔐 Security Notes

- The Google API key should be kept secure
- Consider using environment variables instead of hardcoding in config files
- The MCP server only has access to the documentation - it cannot modify files or execute arbitrary code

## 📖 Learn More

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop MCP Guide](https://modelcontextprotocol.io/quickstart/user)

## 🎯 Benefits of Using MCP

1. **Seamless Integration**: Works with any MCP-compatible LLM client
2. **Always Up-to-Date**: Queries the latest ingested documentation
3. **Context-Aware**: RAG system provides relevant, accurate answers
4. **No Copy-Paste**: LLM can directly query documentation as needed
5. **Efficient**: Only retrieves relevant information, not entire docs

## 🚀 Next Steps

1. Configure the MCP server in your preferred LLM client
2. Start asking questions about Stream Deck plugin development
3. Build amazing Stream Deck plugins with AI assistance!

---

**Need Help?** Check the main [README.md](./README.md) or [GETTING_STARTED.md](./knowledge-base/GETTING_STARTED.md) for more information about the RAG system.

