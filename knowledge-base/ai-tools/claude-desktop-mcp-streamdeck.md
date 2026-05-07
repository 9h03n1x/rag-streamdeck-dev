# Using Claude Desktop with MCP for Stream Deck Development

The Model Context Protocol (MCP) lets Claude Desktop read files and call tools on your local machine. For Stream Deck plugin development, this means Claude can browse this knowledge base, read your plugin source code, and answer questions with direct references to your actual files — no copy-pasting required.

---

## What You Will Achieve

After completing this guide, Claude Desktop will be able to:

- Browse and read any file in this knowledge base on demand
- Search your plugin's source directory without you pasting code
- Answer questions with citations that point to the exact file and line number
- Remain in sync as your files change — no re-upload needed

---

## Prerequisites

- Claude Desktop installed and signed in ([claude-desktop-getting-started.md](claude-desktop-getting-started.md))
- Node.js 18 or later on your PATH (verify with `node --version`)
- This knowledge base cloned locally, or added as a submodule to your plugin project

---

## How MCP Works in Claude Desktop

```
Claude Desktop
     │
     │ MCP protocol (JSON-RPC over stdio)
     ▼
MCP Server process (runs on your machine)
     │
     │ filesystem / tool access
     ▼
Your local files and tools
```

Claude Desktop starts and manages MCP server processes automatically. You configure which servers to start in a JSON file. Claude can then call into those servers during a conversation — reading files, listing directories, or running tools — without leaving the chat.

---

## Step 1: Install the Filesystem MCP Server

The official `@modelcontextprotocol/server-filesystem` package is the standard way to expose local directories to Claude Desktop.

```bash
npm install -g @modelcontextprotocol/server-filesystem
```

Verify the installation:

```bash
npx @modelcontextprotocol/server-filesystem --version
```

---

## Step 2: Locate the Claude Desktop Config File

Claude Desktop reads MCP server configuration from a JSON file in a fixed location:

| Platform | Config file path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

If the file does not exist yet, create it. On Windows, `%APPDATA%` expands to something like `C:\Users\YourName\AppData\Roaming`.

---

## Step 3: Configure MCP Servers

Open `claude_desktop_config.json` in a text editor and add your server configuration. Adjust the paths to match your actual directory locations.

### macOS example

```json
{
  "mcpServers": {
    "streamdeck-kb": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/projects/rag-streamdeck-dev/knowledge-base"
      ]
    },
    "my-plugin": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/projects/my-streamdeck-plugin/src"
      ]
    }
  }
}
```

### Windows example

```json
{
  "mcpServers": {
    "streamdeck-kb": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\YourName\\projects\\rag-streamdeck-dev\\knowledge-base"
      ]
    },
    "my-plugin": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\YourName\\projects\\my-streamdeck-plugin\\src"
      ]
    }
  }
}
```

> **Security note:** The filesystem server grants Claude read access to the specified directory and all its subdirectories. Only expose directories you intend Claude to read. Never point a server at directories containing credentials, `.env` files, or other sensitive data. Add a second server entry for each additional directory you want to expose rather than using a broad root path.

---

## Step 4: Restart Claude Desktop

MCP server configuration is read at startup. After saving `claude_desktop_config.json`:

1. Quit Claude Desktop completely (macOS: `⌘ Q`; Windows: right-click tray icon → Quit).
2. Relaunch Claude Desktop.

---

## Step 5: Verify the Connection

Start a new chat and look for the **MCP tools** indicator (a hammer icon or "tools available" badge depending on your Claude Desktop version). You can also test directly:

```
You: List the files in the knowledge-base root directory.
```

Claude should respond by calling the filesystem server's `list_directory` tool and showing you the actual files — `INDEX.md`, `GETTING_STARTED.md`, `QUICK_REFERENCE.md`, and the subdirectories.

If Claude responds that it cannot access files, see [Troubleshooting](#troubleshooting) below.

---

## Using MCP in Conversations

Once connected, you can reference files naturally in your questions.

### Browse the knowledge base

```
Read INDEX.md and give me a summary of what topics are covered.
```

```
What does the SDK 2.1.0 update guide say about the required Node.js version?
```

### Get architecture guidance from canonical docs

```
I need to persist settings per-action, not globally.
Read the settings-persistence article and show me the correct pattern.
```

### Review your own plugin code

```
Read src/actions/my-action.ts.
Does it follow the SingletonAction pattern correctly for SDK 2.1.0?
```

### Cross-reference multiple sources

```
Read core-concepts/action-development.md and then look at my
src/actions/counter.ts. Are there any lifecycle events I'm not handling?
```

### Ask for citations

```
Read the OAuth implementation guide and list the three most important
security requirements. Quote the exact sentences.
```

---

## Combining MCP with a Project System Prompt

For the best experience, set up a Claude Desktop **Project** with an MCP-aware system prompt:

1. Create a new Project: **Stream Deck Plugin — [Your Plugin Name]**
2. Set the project instructions:

```
You are a TypeScript expert helping me build a Stream Deck plugin.

SDK baseline:
- @elgato/streamdeck 2.1.0
- SDKVersion: 3
- Node.js 24
- Stream Deck 7.1+

You have MCP access to two directories:
- streamdeck-kb: the Stream Deck plugin development knowledge base
- my-plugin: my plugin's src/ directory

When answering questions about SDK patterns, architecture, or best practices,
read the relevant knowledge base articles first and cite the file you used.
When reviewing my code, read the actual file rather than asking me to paste it.
```

3. Start conversations in this project — Claude will automatically use MCP tools when relevant.

---

## Useful MCP Server Combinations

You can define multiple MCP servers for different parts of your workflow:

```json
{
  "mcpServers": {
    "streamdeck-kb": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/knowledge-base"]
    },
    "plugin-src": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/plugin/src"]
    },
    "plugin-root": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/plugin"]
    }
  }
}
```

> Keep each server scoped to a specific directory. Broad paths slow down directory listings and expose more files than Claude needs.

---

## Troubleshooting

### Claude says it cannot access files

1. Confirm `claude_desktop_config.json` is valid JSON (use a JSON validator or `node -e "require('./claude_desktop_config.json')"` to check for syntax errors).
2. Confirm the paths in the config exist on disk.
3. Confirm you fully quit and relaunched Claude Desktop after saving the config.
4. On Windows, ensure backslashes are escaped (`\\`) in the JSON string.

### MCP server fails to start

Open Claude Desktop settings (⚙) and look for an MCP server status panel. Error messages from server startup are shown there. Common causes:
- `npx` is not on the PATH that Claude Desktop uses — try the full path to `npx` instead.
- The `@modelcontextprotocol/server-filesystem` package could not be downloaded — check your internet connection or install it globally first with `npm install -g @modelcontextprotocol/server-filesystem`.

### Responses are slow when using MCP

Each MCP tool call (file read, directory list) adds a round-trip. For long files, ask Claude to read only the section you need:

```
Read only the "Settings Persistence" section of core-concepts/settings-persistence.md.
```

### Claude reads the wrong file

Check that your server path points to the correct root directory. If you have two servers covering overlapping paths, specify which server's root to use in your prompt:

```
Using the streamdeck-kb server, read reference/api-reference.md.
```

---

## Next Steps

- **Set up your development environment**: [../development-workflow/environment-setup.md](../development-workflow/environment-setup.md)
- **Understand the plugin architecture**: [../core-concepts/architecture-overview.md](../core-concepts/architecture-overview.md)
- **Explore the full knowledge base index**: [../INDEX.md](../INDEX.md)
