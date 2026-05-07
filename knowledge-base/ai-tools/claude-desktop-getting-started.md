# Getting Started with Claude Desktop

Claude Desktop is Anthropic's native application for macOS and Windows that gives you direct, persistent access to Claude outside of a web browser. For Stream Deck plugin developers, it provides a fast, project-aware AI companion you can keep open alongside your editor.

---

## What Claude Desktop Offers

| Feature | Description |
|---|---|
| **Projects** | Persistent conversation workspaces with shared context and uploaded files |
| **Extended context** | Larger context windows than the web app in most plans |
| **File uploads** | Drag in source files, manifests, or markdown docs for in-context review |
| **MCP integration** | Connect local servers to give Claude access to your filesystem, tools, or APIs |
| **Keyboard-first** | Global shortcut to open Claude from any application |
| **Offline resilience** | Conversations and project files persist locally between sessions |

---

## Prerequisites

- macOS 12 Monterey or later **or** Windows 10 (64-bit) or later
- An Anthropic account (free tier available at [claude.ai](https://claude.ai))
- Approximately 200 MB of disk space

---

## Installation

### macOS

1. Open [claude.ai/download](https://claude.ai/download) in your browser.
2. Click **Download for Mac** — this downloads a `.dmg` file.
3. Open the `.dmg`, drag **Claude** into your Applications folder.
4. Launch Claude from Applications or Spotlight (`⌘ Space` → type `Claude`).
5. Sign in with your Anthropic account when prompted.

### Windows

1. Open [claude.ai/download](https://claude.ai/download) in your browser.
2. Click **Download for Windows** — this downloads a `.exe` installer.
3. Run the installer and follow the prompts. Claude installs to `%LOCALAPPDATA%\Claude` by default.
4. Launch Claude from the Start menu or desktop shortcut.
5. Sign in with your Anthropic account when prompted.

> **Tip:** On macOS, right-click the app in the Dock and select **Options → Keep in Dock** so it's always one click away during development.

---

## First Launch

When Claude Desktop opens for the first time you will see:

```
┌─────────────────────────────────────┐
│  ☰  Claude           [New Chat] [⚙] │
├──────────────┬──────────────────────┤
│ Projects     │                      │
│  ─ ─ ─ ─    │   Start a new chat   │
│ Recents      │   or open a Project  │
│  ─ ─ ─ ─    │                      │
└──────────────┴──────────────────────┘
```

- **Left panel**: Projects and recent conversations.
- **Main area**: Active conversation or welcome screen.
- **Top-right gear (⚙)**: Settings — plan, appearance, and MCP servers.

---

## Core Concepts

### Chats vs. Projects

**Chats** are standalone conversations. Context resets each time you start a new chat.

**Projects** are persistent workspaces. Each project has:
- A **system prompt** you write once to describe your codebase and preferences.
- **Project files** — markdown docs, source files, or notes that Claude always has in context.
- All conversations in the project share that same context.

For Stream Deck development, one project per plugin works well.

### How Context Works

Claude reads everything in the current context window: your message, the conversation history, and any uploaded project files. The context window resets when you start a new chat but persists within a single conversation or project session.

---

## Setting Up Your First Project

1. Click **New Project** in the left panel.
2. Name it, for example: `Stream Deck Plugin - My Plugin Name`.
3. Click **Edit project instructions** and add a system prompt:

```
You are a TypeScript expert helping me build a Stream Deck plugin using SDK 2.1.0.
The plugin uses Node.js 24, SDKVersion 3, and targets Stream Deck 7.1+.
When I paste code, focus on correctness, type safety, and SDK patterns.
Keep answers concise and code-focused.
```

4. Upload reference files by clicking the **+** icon in the project file panel:
   - Your `manifest.json`
   - Key action source files (`src/actions/*.ts`)
   - This knowledge base's `QUICK_REFERENCE.md` if you have a local copy

5. Start a conversation in the project — Claude now has persistent context about your plugin.

---

## Keyboard Shortcuts

| Action | macOS | Windows |
|---|---|---|
| Global open/focus | `⌥ Space` | `Alt + Space` |
| New chat | `⌘ N` | `Ctrl + N` |
| New project | `⌘ Shift + N` | `Ctrl + Shift + N` |
| Open settings | `⌘ ,` | `Ctrl + ,` |
| Submit message | `Return` | `Enter` |
| New line in message | `Shift + Return` | `Shift + Enter` |
| Copy last response | `⌘ Shift + C` | `Ctrl + Shift + C` |

---

## Uploading Files for Review

You can drag files directly into the chat input, or click the **paperclip icon**:

- **TypeScript source files**: Paste or upload an action file to get a review.
- **`manifest.json`**: Ask Claude to validate the schema or add a new action entry.
- **Error logs**: Paste Node.js crash output and ask for a root cause analysis.
- **Markdown docs**: Upload a knowledge base article and ask targeted questions.

File types accepted: `.ts`, `.js`, `.json`, `.md`, `.txt`, `.html`, `.css`, and common image formats.

---

## Effective Prompting for Plugin Development

### Be specific about what you want

```
# Too vague
"Fix this code"

# Better
"This TypeScript action class compiles but the onKeyDown event never fires.
 I'm using SDK 2.1.0. What are the most common causes?"
```

### Provide the relevant snippet, not the whole file

Paste only the function or class under discussion. Claude has a large but finite context; focused input gets focused output.

### Ask for one thing at a time

```
# Multi-step (breaks into separate messages)
1. "Review this action class for type errors."
2. "Now add settings persistence using setSettings."
3. "Write a unit test for the onKeyDown handler."
```

### Reference the SDK version explicitly

Stream Deck plugin patterns changed between SDK v1 and v2. Always state:

```
Using SDK 2.1.0 (SDKVersion: 3, Node.js 24, Stream Deck 7.1+)
```

---

## Plan Comparison

| Feature | Free | Pro | Max |
|---|---|---|---|
| Claude 3.5 Sonnet access | ✓ | ✓ | ✓ |
| Claude 3 Opus access | — | ✓ | ✓ |
| Projects | Limited | Unlimited | Unlimited |
| Extended context | — | ✓ | ✓ |
| MCP server integration | ✓ | ✓ | ✓ |
| Priority access | — | — | ✓ |

> Plan details change — check [claude.ai/pricing](https://claude.ai/pricing) for current information.

---

## Next Steps

- **Connect to your knowledge base via MCP**: [claude-desktop-mcp-streamdeck.md](claude-desktop-mcp-streamdeck.md) — give Claude direct filesystem access to this knowledge base for accurate, citation-backed answers.
- **Learn the Stream Deck architecture**: [../core-concepts/architecture-overview.md](../core-concepts/architecture-overview.md)
- **Start building**: [../development-workflow/environment-setup.md](../development-workflow/environment-setup.md)
