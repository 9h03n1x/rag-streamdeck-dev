# GitHub Copilot Agents, Slash Commands, and Prompt Templates for Stream Deck Development

This article covers every built-in Copilot agent and slash command available in VS Code, with Stream Deck-specific examples for each. It also provides ready-to-use `.prompt.md` files you can drop into your plugin repository to automate repeated tasks.

---

## Built-In Agents

Agents give Copilot Chat a broader awareness beyond the current file. Invoke them by typing `@agent-name` at the start of your message.

### `@workspace`

Searches and reasons across your entire project. Use this when your question involves multiple files, cross-cutting patterns, or project structure.

```
@workspace Where is global settings persistence implemented?
```

```
@workspace List all action classes that handle onDialRotate events.
```

```
@workspace Which actions register event listeners but never call streamDeck.connect()?
```

```
@workspace Does any action import from a path that no longer exists?
```

### `@vscode`

Answers questions about VS Code itself — settings, keybindings, extensions, and editor configuration. Useful when you want to tune your development environment.

```
@vscode How do I configure the TypeScript language server to show inlay hints for parameter names?
```

```
@vscode What launch.json configuration do I need to attach the Node.js debugger to a Stream Deck plugin process?
```

### `@terminal`

Explains terminal commands and helps diagnose shell output. Attach terminal context with `#terminalLastCommand`.

```
@terminal #terminalLastCommand What does this build error mean and how do I fix it?
```

```
@terminal How do I watch for TypeScript compilation errors and rebuild on save?
```

### `@github`

Searches GitHub issues, pull requests, commits, and code. Requires the GitHub pull request extension.

```
@github What changed in @elgato/streamdeck between 2.0.0 and 2.1.0?
```

```
@github Are there any open issues in the elgatosf/streamdeck repository about dial events?
```

---

## Slash Commands

Slash commands are structured operations you run against selected code or an attached file. Type `/` in the Chat panel to see the full list.

### `/explain`

Explains what selected code does. Select a method, class, or file, then run:

```
/explain
```

Or target a specific area:

```
/explain #file:src/actions/my-action.ts
Explain how the onKeyDown handler manages state.
```

### `/fix`

Diagnoses and fixes a problem in selected code or an attached file.

```
/fix
```

Targeted:

```
/fix #file:src/actions/counter.ts
The settings are not being saved between Stream Deck restarts.
```

```
/fix #terminalLastCommand
```

### `/tests`

Generates unit tests for selected code. Works well with SDK action classes.

```
/tests
```

With context:

```
/tests #file:src/actions/timer.ts
Generate Vitest unit tests. Mock the Stream Deck SDK using the
@elgato/streamdeck test utilities. Cover onKeyDown, onKeyUp, and
the settings loading path.
```

### `/doc`

Adds JSDoc comments to selected code.

```
/doc
```

### `/new`

Scaffolds a new project, file, or component from a description. Opens a proposed file tree you can accept file-by-file.

```
/new A Stream Deck plugin called "Focus Timer" with a single action
that starts and stops a Pomodoro timer. Node.js 24, SDK 2.1.0,
TypeScript strict mode.
```

### `/newNotebook`

Creates a Jupyter notebook. Not typically relevant for Stream Deck plugin development.

---

## Stream Deck–Specific Prompt Examples

Copy these directly into the Chat panel. Add file attachments with `#file:` as needed.

### Architecture and code review

```
@workspace Review the structure of this plugin against the SDK 2.1.0
SingletonAction pattern. Flag any actions that:
1. Use the legacy onConnected event instead of streamDeck.connect()
2. Store per-key state outside of setSettings
3. Register duplicate listeners
```

```
#file:manifest.json
Validate this manifest against SDK 2.1.0 requirements:
- SDKVersion must be 3
- Nodejs.Version must be "24"
- Software.MinimumVersion must be "7.1" or higher
- Every action UUID must be lowercase and reverse-domain formatted
List any violations.
```

### Settings persistence

```
#file:src/actions/my-action.ts
This action uses local variables to store state. Refactor it to use
setSettings and onDidReceiveSettings so state survives plugin restarts.
Keep the existing TypeScript types and do not change the public interface.
```

### Property Inspector integration

```
#file:src/actions/my-action.ts #file:src/pi/my-action.html
The action and Property Inspector are not communicating correctly.
Trace the full message flow:
1. PI sends sendToPlugin
2. Action receives onSendToPlugin
3. Action replies with sendToPropertyInspector
4. PI receives sendToPlugin callback
Identify where the flow breaks.
```

### New action scaffolding

```
Scaffold a new SingletonAction for SDK 2.1.0 called "VolumeControl".
It should:
- Show the current volume level as the key title
- Increment volume by 5% on key press
- Support a configurable step size stored in settings
- Include the settings interface, action class, and a stub PI HTML file
Use TypeScript strict mode and the @elgato/streamdeck import style.
```

### Debugging

```
#terminalLastCommand
This is the Node.js crash output from my Stream Deck plugin.
Identify the root cause, explain why it happens in the Stream Deck
plugin lifecycle, and suggest the minimal fix.
```

```
@workspace
The plugin connects successfully but no key press events are received.
List the five most likely causes in order of probability for SDK 2.1.0
and suggest how to test each one.
```

### Manifest entry for a new action

```
#file:manifest.json
Add a new action entry for an action with:
- Name: "Open URL"
- UUID: com.example.myplugin.openurl
- Icon path: imgs/actions/open-url/action
- A single property inspector at src/pi/open-url.html
- Supported on Stream Deck XL and Stream Deck (not Plus dial)
Return only the new Actions array entry, formatted to match the existing style.
```

---

## Prompt Files (`.prompt.md`)

Prompt files are reusable, parameterised prompts stored in your repository. You invoke them from the Chat panel without retyping the full instruction each time.

### Setting Up

Create the directory and files in your plugin repository:

```
.github/
  prompts/
    new-action.prompt.md
    review-action.prompt.md
    scaffold-pi.prompt.md
    add-manifest-action.prompt.md
```

Run a prompt file from the Command Palette: **Chat: Run Prompt** → select the file. Or reference it in the Chat panel with `#file:.github/prompts/new-action.prompt.md`.

---

### `new-action.prompt.md`

Scaffolds a complete new action class with settings interface.

```markdown
---
mode: ask
---

Scaffold a new Stream Deck action for SDK 2.1.0 with the following specification:

Action name: [ACTION_NAME]
Action UUID: [REVERSE_DOMAIN_UUID]
Description: [ONE_LINE_DESCRIPTION]

Requirements:
- Extend SingletonAction from @elgato/streamdeck
- Define a typed Settings interface named [ACTION_NAME]Settings
- Handle onKeyDown (or onDialRotate if this is a dial action)
- Load settings via onDidReceiveSettings
- Include TSDoc on the class and settings interface
- Place the file at src/actions/[kebab-case-name].ts

Do not generate the manifest entry or PI file — only the action class.
```

---

### `review-action.prompt.md`

Reviews an action class against SDK 2.1.0 patterns.

```markdown
---
mode: ask
---

Review the attached action class against these SDK 2.1.0 requirements:

1. Extends SingletonAction (not Action or custom base class)
2. Uses onDidReceiveSettings for settings loading, not a constructor argument
3. Calls ev.action.setTitle / setImage / setState via the event's action handle, not a stored reference
4. Does not store mutable key state in class-level variables (use setSettings instead)
5. Does not call streamDeck.connect() manually (the SDK handles connection)
6. Imports come from @elgato/streamdeck, not from internal SDK paths

Report each violation with the line number, the rule it breaks, and the corrected code.
If no violations are found, confirm the class is compliant.
```

---

### `scaffold-pi.prompt.md`

Generates a Property Inspector HTML file for an existing action.

```markdown
---
mode: ask
---

Generate a Property Inspector HTML file for the attached action class.

Requirements:
- Use the sdpi-components web component library
  (script tag: https://cdn.jsdelivr.net/npm/@elgato-stream-deck/sdpi-components@latest/dist/sdpi-components.js)
- Include an sdpi-item for each field in the Settings interface
- Send settings to the plugin using streamDeck.onDidConnectToSocket and streamDeckClient.setSettings
- Receive settings via streamDeckClient.onDidReceiveSettings and populate the form
- Output valid standalone HTML (no bundler required)
- Place comment markers for each settings field so they are easy to find

Output only the HTML file content.
```

---

### `add-manifest-action.prompt.md`

Adds a new action block to an existing manifest.

```markdown
---
mode: ask
---

Add a new action entry to the manifest for the following specification:

#file:manifest.json

Action name: [ACTION_NAME]
UUID: [REVERSE_DOMAIN_UUID]
Icon prefix path: imgs/actions/[icon-folder]/action
Property Inspector: src/pi/[kebab-name].html
Supported controllers: [Keypad | Encoder | both]

Rules:
- Match the indentation and key ordering of existing action entries
- Do not add optional keys that are not present in other entries
- Return only the new JSON object for the Actions array, not the full manifest
```

---

## Custom Instructions Reference

Place `.github/copilot-instructions.md` in your plugin repository. VS Code reads it for every Copilot interaction in that workspace. Below is a complete template:

```markdown
## Project: [Plugin Name]

This is a Stream Deck plugin built with the Elgato Stream Deck TypeScript SDK 2.1.0.

### SDK Baseline

- @elgato/streamdeck 2.1.0
- SDKVersion: 3
- Node.js 24
- Stream Deck 7.1+ (Software.MinimumVersion "7.1")

### Conventions

- All actions extend SingletonAction imported from @elgato/streamdeck
- Settings interfaces are co-located in the action file, named [ActionName]Settings
- Property Inspector files live in src/pi/ as standalone HTML using sdpi-components
- Actions live in src/actions/
- Shared utilities live in src/utils/
- Tests use Vitest and the @elgato/streamdeck test utilities

### What to avoid

- Do not suggest SDK v1 patterns (older streamdeck-plugin-template, PluginAction, etc.)
- Do not import from internal SDK paths — only from @elgato/streamdeck
- Do not store mutable per-key state in class-level variables; use setSettings instead

### When generating code

1. State the SDK class or method you are using and confirm it is in 2.1.0
2. Include the Settings interface if settings are involved
3. Add TSDoc on public methods and the settings interface
```

---

## Quick Reference: When to Use What

| You want to... | Use |
|---|---|
| Ask about your whole project | `@workspace` |
| Understand a piece of code | `/explain` + selection |
| Fix a bug in a file | `/fix` + `#file:` |
| Generate tests | `/tests` + `#file:` |
| Diagnose a crash | `@terminal` + `#terminalLastCommand` |
| Scaffold a new action | `new-action.prompt.md` |
| Audit an action class | `review-action.prompt.md` |
| Build a Property Inspector | `scaffold-pi.prompt.md` |
| Add a manifest entry | `add-manifest-action.prompt.md` |
| Multi-file edits | Copilot Edits panel |
| Autonomous task completion | Agent mode |

---

## Related Articles

- [copilot-vscode-getting-started.md](copilot-vscode-getting-started.md) — installation, Chat interface, and custom instructions setup
- [agent-spec-driven-development.md](agent-spec-driven-development.md) — spec-driven, test-first workflow for using agents effectively: write the spec, write failing tests, implement to green
- [claude-desktop-getting-started.md](claude-desktop-getting-started.md) — getting started with Claude Desktop
- [claude-desktop-mcp-streamdeck.md](claude-desktop-mcp-streamdeck.md) — giving Claude direct filesystem access to this knowledge base
- [../core-concepts/action-development.md](../core-concepts/action-development.md) — SingletonAction patterns the prompts above reference
- [../reference/api-reference.md](../reference/api-reference.md) — SDK API used in prompt examples
