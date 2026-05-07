# Getting Started with GitHub Copilot in VS Code for Stream Deck Development

GitHub Copilot integrates directly into VS Code and provides AI assistance across completions, chat, edits, and automated code review. For Stream Deck plugin development it understands your TypeScript source, manifest, and property inspector code in-context and requires no external configuration to get started.

---

## What GitHub Copilot Offers in VS Code

| Feature | What it does |
|---|---|
| **Inline completions** | Suggests the next line or block as you type, based on surrounding code |
| **Copilot Chat** | Conversational AI panel with workspace-aware agents and slash commands |
| **Copilot Edits** | Multi-file editing sessions with natural-language instructions |
| **Agent mode** | Copilot autonomously reads, edits, and runs tasks across your project |
| **Custom instructions** | A `.github/copilot-instructions.md` file that scopes every Copilot response to your codebase |
| **Prompt files** | Reusable `.prompt.md` files for repeated tasks such as scaffolding a new action |
| **Code review** | On-demand review of a diff or file with actionable suggestions |

---

## Prerequisites

- VS Code 1.90 or later (the month Copilot Chat became generally available)
- A GitHub account with an active Copilot subscription (Individual, Business, or Enterprise)
- The **GitHub Copilot** and **GitHub Copilot Chat** extensions installed in VS Code

---

## Installation

1. Open VS Code and go to the Extensions panel (`Ctrl+Shift+X` / `⌘⇧X`).
2. Search for **GitHub Copilot** and install the extension published by GitHub.
3. The **GitHub Copilot Chat** extension is installed automatically as a dependency.
4. When prompted, sign in with your GitHub account.
5. Verify activation: the Copilot icon (✦) appears in the VS Code status bar.

> If the status bar shows a warning, open the Command Palette (`Ctrl+Shift+P` / `⌘⇧P`) and run **GitHub Copilot: Sign In**.

---

## Opening Copilot Chat

| Method | Shortcut |
|---|---|
| Toggle Chat panel | `Ctrl+Alt+I` / `⌃⌘I` |
| Inline chat (in editor) | `Ctrl+I` / `⌘I` |
| Quick chat (floating) | `Ctrl+Shift+Alt+L` / `⌘⇧⌥L` |
| Open panel via Command Palette | `> GitHub Copilot: Open Chat` |

The **Chat panel** opens on the left or right side and is best for multi-turn conversations. **Inline chat** opens directly inside the editor over the code you have selected — useful for focused rewrites.

---

## Copilot Chat Interface

```
┌──────────────────────────────────────────────────┐
│  CHAT                              [New] [History]│
├──────────────────────────────────────────────────┤
│  @workspace  /fix  /explain  /tests  /doc        │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │  Ask Copilot or type / for commands...     │  │
│  │                                        [↑] │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

- **`@` prefix**: invokes an agent that has broader awareness (e.g., `@workspace`)
- **`/` prefix**: runs a slash command (e.g., `/explain`, `/fix`, `/tests`)
- **`#` prefix**: attaches a specific context item (e.g., `#file`, `#selection`)

---

## Setting Up Custom Instructions for Stream Deck Development

Custom instructions tell Copilot about your project once, so you don't repeat it in every prompt. Create the file at the root of your plugin repository:

**`.github/copilot-instructions.md`**:

```markdown
This is a Stream Deck plugin built with the Elgato Stream Deck TypeScript SDK 2.1.0.

Key constraints:
- Node.js 24 runtime
- SDKVersion: 3 in manifest.json
- Software.MinimumVersion "7.1" in manifest.json
- All actions extend SingletonAction from @elgato/streamdeck
- Property Inspector uses SDPI component library (sdpi-components)

Coding conventions:
- TypeScript strict mode
- Actions live in src/actions/
- Property Inspector HTML files live in src/pi/
- Settings interfaces are defined alongside the action that uses them

When suggesting code, always use SDK 2.1.0 patterns (not SDK v1 patterns).
When referencing the API, note which method belongs to which SDK class.
```

VS Code reads this file automatically for every Copilot interaction in that workspace.

---

## Attaching Context with `#`

You can pin specific files or selections to a prompt using `#`:

| Context attachment | Example |
|---|---|
| `#file` | `#file:src/actions/counter.ts` |
| `#selection` | Select code, then press `Ctrl+I` |
| `#codebase` | Searches the entire workspace index |
| `#terminalLastCommand` | Attaches the last terminal output |
| `#terminalSelection` | Attaches highlighted text in the terminal |

Example:

```
#file:src/actions/counter.ts #file:manifest.json
Does the UUID in the action class match the UUID in the manifest?
```

---

## Copilot Edits

Copilot Edits lets you describe a multi-file change in plain language and review the diff before applying it.

1. Open the Copilot Edits panel: **View → Copilot Edits** or `Ctrl+Shift+Alt+I` / `⌘⇧⌥I`.
2. Add the files you want to edit using the **+ Add Files** button.
3. Describe what you want in the chat input.
4. Review the proposed diff in the editor and click **Accept** or **Discard** per file.

Example edit request:

```
Add a global settings interface and wire it to the existing action using
streamDeck.settings.getGlobalSettings(). Update both the action class
and the property inspector to read and display the new setting.
```

---

## Agent Mode

Agent mode gives Copilot permission to run a sequence of steps autonomously — reading files, making edits, running terminal commands, and checking for errors — until the task is complete.

Enable it in the Chat panel by switching the mode dropdown from **Ask** to **Agent**.

> Agent mode can run terminal commands. Review what it plans to do before confirming each step, especially for commands that write to disk or install packages.

---

## Next Steps

- **Agents and prompt reference**: [copilot-agents-and-prompts.md](copilot-agents-and-prompts.md) — all available agents, slash commands, and reusable `.prompt.md` templates for Stream Deck development
- **Learn the plugin architecture**: [../core-concepts/architecture-overview.md](../core-concepts/architecture-overview.md)
- **Start building**: [../development-workflow/environment-setup.md](../development-workflow/environment-setup.md)
