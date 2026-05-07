# Advanced Property Inspector Topics

## Overview

The Property Inspector (PI) is an HTML page rendered inside the Stream Deck application when a user selects an action. It communicates with the plugin backend via `sendToPlugin` / `sendToPropertyInspector`. This guide covers advanced UI patterns beyond the basic SDPI Components form elements.

## Complex Form Validation

### Synchronous Validation

```javascript
function validatePort(value) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num > 65535) {
        return "Port must be between 1 and 65535";
    }
    return null; // valid
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    let errorEl = field.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("sdpi-field-error")) {
        errorEl = document.createElement("span");
        errorEl.className = "sdpi-field-error";
        errorEl.style.cssText = "color: #e74c3c; font-size: 11px; margin-top: 2px; display: block;";
        field.parentNode.insertBefore(errorEl, field.nextSibling);
    }
    errorEl.textContent = message ?? "";
    errorEl.style.display = message ? "block" : "none";
}

document.getElementById("port-input").addEventListener("input", (e) => {
    const error = validatePort(e.target.value);
    showError("port-input", error);
});
```

### Asynchronous Validation

```javascript
let validationTimer;

async function validateApiKey(key) {
    if (!key || key.length < 10) return "API key is too short";
    try {
        const resp = await fetch(`https://api.example.com/validate?key=${encodeURIComponent(key)}`);
        const data = await resp.json();
        return data.valid ? null : "Invalid API key";
    } catch {
        return "Could not verify key (network error)";
    }
}

document.getElementById("api-key").addEventListener("input", (e) => {
    clearTimeout(validationTimer);
    showError("api-key", null); // clear previous error
    showLoading("api-key", true);

    validationTimer = setTimeout(async () => {
        const error = await validateApiKey(e.target.value);
        showLoading("api-key", false);
        showError("api-key", error);
    }, 600); // debounce 600ms
});

function showLoading(fieldId, loading) {
    const el = document.getElementById(fieldId);
    el.style.opacity = loading ? "0.5" : "1";
}
```

### Cross-Field Validation

```javascript
function validatePasswordMatch() {
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;
    if (confirm && password !== confirm) {
        showError("confirm-password", "Passwords do not match");
        return false;
    }
    showError("confirm-password", null);
    return true;
}

["password", "confirm-password"].forEach((id) => {
    document.getElementById(id).addEventListener("input", validatePasswordMatch);
});
```

## Multi-Page Interfaces

### Wizard Pattern (Step-by-Step)

```html
<!-- wizard-pi.html -->
<div id="step-1" class="wizard-step">
    <sdpi-item label="Server URL">
        <sdpi-textfield id="server-url" setting="serverUrl"></sdpi-textfield>
    </sdpi-item>
    <button id="next-1" class="sdpi-btn">Next →</button>
</div>

<div id="step-2" class="wizard-step" style="display:none">
    <sdpi-item label="API Key">
        <sdpi-textfield id="api-key" setting="apiKey" type="password"></sdpi-textfield>
    </sdpi-item>
    <button id="back-2" class="sdpi-btn sdpi-btn-secondary">← Back</button>
    <button id="next-2" class="sdpi-btn">Next →</button>
</div>

<div id="step-3" class="wizard-step" style="display:none">
    <p class="sdpi-item-label">Configuration complete!</p>
    <button id="back-3" class="sdpi-btn sdpi-btn-secondary">← Back</button>
    <button id="finish" class="sdpi-btn sdpi-btn-primary">Finish</button>
</div>
```

```javascript
let currentStep = 1;
const totalSteps = 3;

function goToStep(n) {
    document.getElementById(`step-${currentStep}`).style.display = "none";
    currentStep = Math.max(1, Math.min(n, totalSteps));
    document.getElementById(`step-${currentStep}`).style.display = "block";
    updateStepIndicator();
}

function updateStepIndicator() {
    document.getElementById("step-indicator").textContent =
        `Step ${currentStep} of ${totalSteps}`;
}

document.getElementById("next-1").addEventListener("click", () => {
    const url = document.getElementById("server-url").value;
    if (!url) return showError("server-url", "Server URL is required");
    goToStep(2);
});
document.getElementById("next-2").addEventListener("click", () => goToStep(3));
document.getElementById("back-2").addEventListener("click", () => goToStep(1));
document.getElementById("back-3").addEventListener("click", () => goToStep(2));
document.getElementById("finish").addEventListener("click", () => {
    window.SDPIComponents.streamDeckClient.setSettings({
        serverUrl: document.getElementById("server-url").value,
        apiKey: document.getElementById("api-key").value,
    });
});
```

### Tab Navigation

```html
<div class="sdpi-tabs">
    <button class="sdpi-tab active" data-tab="general">General</button>
    <button class="sdpi-tab" data-tab="appearance">Appearance</button>
    <button class="sdpi-tab" data-tab="advanced">Advanced</button>
</div>

<div id="tab-general" class="sdpi-tab-content">
    <!-- General settings -->
</div>
<div id="tab-appearance" class="sdpi-tab-content" style="display:none">
    <!-- Appearance settings -->
</div>
<div id="tab-advanced" class="sdpi-tab-content" style="display:none">
    <!-- Advanced settings -->
</div>
```

```javascript
document.querySelectorAll(".sdpi-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".sdpi-tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".sdpi-tab-content").forEach((c) => {
            c.style.display = "none";
        });
        tab.classList.add("active");
        document.getElementById(`tab-${tab.dataset.tab}`).style.display = "block";
    });
});
```

### Accordion Sections

```html
<div class="accordion">
    <button class="accordion-header">Advanced Options ▼</button>
    <div class="accordion-body" style="display:none">
        <!-- Advanced fields -->
    </div>
</div>
```

```javascript
document.querySelectorAll(".accordion-header").forEach((header) => {
    header.addEventListener("click", () => {
        const body = header.nextElementSibling;
        const isOpen = body.style.display !== "none";
        body.style.display = isOpen ? "none" : "block";
        header.textContent = header.textContent.replace(isOpen ? "▲" : "▼", isOpen ? "▼" : "▲");
    });
});
```

## Conditional Fields

### Show/Hide Based on Selection

```javascript
function updateFieldVisibility() {
    const mode = document.getElementById("mode-select").value;
    document.getElementById("url-group").style.display =
        mode === "remote" ? "block" : "none";
    document.getElementById("file-group").style.display =
        mode === "local" ? "block" : "none";
}

document.getElementById("mode-select").addEventListener("change", updateFieldVisibility);
// Run on load
updateFieldVisibility();
```

### Cascading / Dependent Dropdowns

```javascript
const regions = {
    "us": ["us-east-1", "us-west-1", "us-west-2"],
    "eu": ["eu-west-1", "eu-central-1"],
    "ap": ["ap-southeast-1", "ap-northeast-1"],
};

function populateRegions(provider) {
    const regionSelect = document.getElementById("region");
    regionSelect.innerHTML = "";
    (regions[provider] ?? []).forEach((r) => {
        const opt = document.createElement("option");
        opt.value = r;
        opt.textContent = r;
        regionSelect.appendChild(opt);
    });
}

document.getElementById("provider").addEventListener("change", (e) => {
    populateRegions(e.target.value);
});

// On settings load:
const { streamDeckClient } = window.SDPIComponents;
streamDeckClient.getSettings().then((settings) => {
    document.getElementById("provider").value = settings.provider ?? "us";
    populateRegions(settings.provider ?? "us");
    document.getElementById("region").value = settings.region ?? "";
});
```

## Dynamic Forms

### Adding and Removing List Items

```html
<div id="url-list"></div>
<button id="add-url">+ Add URL</button>
```

```javascript
let urlItems = [];

function renderList() {
    const container = document.getElementById("url-list");
    container.innerHTML = "";
    urlItems.forEach((url, index) => {
        const row = document.createElement("div");
        row.className = "sdpi-item";
        row.innerHTML = `
            <input type="text" class="sdpi-item-value" value="${url}"
                   data-index="${index}" placeholder="https://...">
            <button class="remove-btn" data-index="${index}">✕</button>
        `;
        container.appendChild(row);
    });

    container.querySelectorAll("input").forEach((input) => {
        input.addEventListener("change", (e) => {
            urlItems[Number(e.target.dataset.index)] = e.target.value;
            saveSettings();
        });
    });
    container.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            urlItems.splice(Number(e.target.dataset.index), 1);
            renderList();
            saveSettings();
        });
    });
}

document.getElementById("add-url").addEventListener("click", () => {
    urlItems.push("");
    renderList();
});

function saveSettings() {
    window.SDPIComponents.streamDeckClient.setSettings({ urls: urlItems });
}
```

## File Handling

### File Selection via Input

```html
<sdpi-item label="Image File">
    <input type="file" id="image-file" accept="image/*" class="sdpi-item-value">
    <img id="image-preview" style="max-width:72px; max-height:72px; margin-top:4px; display:none">
</sdpi-item>
```

```javascript
document.getElementById("image-file").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        // Preview
        const preview = document.getElementById("image-preview");
        preview.src = dataUrl;
        preview.style.display = "block";
        // Save (strip prefix for setImage)
        const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        window.SDPIComponents.streamDeckClient.setSettings({ imageBase64: base64 });
    };
    reader.readAsDataURL(file);
});
```

### Drag and Drop File Upload

```javascript
const dropZone = document.getElementById("drop-zone");

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) {
        handleImageFile(file);
    }
});
```

## Color Pickers

The SDPI Components library does not include a colour picker. Use the native HTML5 `<input type="color">`:

```html
<sdpi-item label="Highlight Color">
    <input type="color" id="color-picker" class="sdpi-item-value" value="#ff6600">
</sdpi-item>
```

```javascript
document.getElementById("color-picker").addEventListener("input", (e) => {
    window.SDPIComponents.streamDeckClient.setSettings({ color: e.target.value });
});

// Load saved color
streamDeckClient.getSettings().then((s) => {
    if (s.color) document.getElementById("color-picker").value = s.color;
});
```

## Data Tables

Display tabular data (e.g., a list of events or log entries) in the PI:

```html
<sdpi-item label="Recent Events">
    <div id="events-table" style="max-height: 150px; overflow-y: auto; width: 100%">
        <table style="width:100%; font-size:11px; border-collapse:collapse">
            <thead>
                <tr>
                    <th style="text-align:left; padding:2px 4px">Time</th>
                    <th style="text-align:left; padding:2px 4px">Event</th>
                </tr>
            </thead>
            <tbody id="events-body"></tbody>
        </table>
    </div>
</sdpi-item>
```

```javascript
function updateEventsTable(events) {
    const tbody = document.getElementById("events-body");
    tbody.innerHTML = events
        .slice(-20) // Show last 20
        .reverse()
        .map((e) => `
            <tr>
                <td style="padding:2px 4px; opacity:0.7">${new Date(e.ts).toLocaleTimeString()}</td>
                <td style="padding:2px 4px">${e.message}</td>
            </tr>
        `)
        .join("");
}

// Receive events from plugin
const { streamDeckClient } = window.SDPIComponents;
streamDeckClient.on("sendToPropertyInspector", (data) => {
    if (data.payload?.type === "events") {
        updateEventsTable(data.payload.events);
    }
});
```

## State Management

### Pattern: Centralised Settings Object

Manage all settings in one object to avoid partial-save issues:

```javascript
let settings = {};

async function loadSettings() {
    settings = await window.SDPIComponents.streamDeckClient.getSettings();
    applySettingsToUI(settings);
}

function applySettingsToUI(s) {
    document.getElementById("host").value = s.host ?? "";
    document.getElementById("port").value = s.port ?? "8080";
    document.getElementById("enabled").checked = s.enabled ?? true;
}

function saveSettings() {
    window.SDPIComponents.streamDeckClient.setSettings({ ...settings });
}

// Update individual fields
document.getElementById("host").addEventListener("change", (e) => {
    settings.host = e.target.value;
    saveSettings();
});

document.addEventListener("DOMContentLoaded", loadSettings);
```

### Syncing Real-Time Data from Plugin

```javascript
// In Property Inspector
const { streamDeckClient } = window.SDPIComponents;
streamDeckClient.on("sendToPropertyInspector", (msg) => {
    if (msg.type === "status-update") {
        document.getElementById("status-label").textContent = msg.status;
        document.getElementById("status-dot").className =
            `status-dot ${msg.connected ? "connected" : "disconnected"}`;
    }
});

// In Plugin (TypeScript)
override async onPropertyInspectorDidAppear(ev): Promise<void> {
    // Push current state immediately when PI opens
    await streamDeck.ui.sendToPropertyInspector({
        type: "status-update",
        status: this.getStatus(),
        connected: this.isConnected,
    });
}
```

## Accessibility

### ARIA Labels and Roles

```html
<sdpi-item label="Volume" role="group" aria-labelledby="volume-label">
    <label id="volume-label" class="sdpi-item-label">Volume</label>
    <input type="range" id="volume" min="0" max="100" value="50"
           aria-label="Volume level" aria-valuemin="0" aria-valuemax="100"
           aria-valuenow="50" class="sdpi-item-value">
    <output for="volume" id="volume-display">50</output>
</sdpi-item>
```

```javascript
document.getElementById("volume").addEventListener("input", (e) => {
    const val = e.target.value;
    e.target.setAttribute("aria-valuenow", val);
    document.getElementById("volume-display").textContent = val;
});
```

### Keyboard Navigation

Ensure every interactive element is reachable by `Tab` and activated by `Enter`/`Space`:

```javascript
// Custom button that responds to keyboard
document.getElementById("custom-btn").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.target.click();
    }
});
```

### Focus Management in Wizards

Move focus to the first field when navigating to a new step:

```javascript
function goToStep(n) {
    // ... step change logic ...
    const firstField = document.querySelector(`#step-${n} input, #step-${n} select`);
    firstField?.focus();
}
```

## Styling

### Matching the Stream Deck Theme

The PI uses CSS custom properties that match the current Stream Deck theme (dark/light). Inherit them:

```css
body {
    background: var(--sdpi-background);
    color: var(--sdpi-color);
    font-family: var(--sdpi-font-family, system-ui);
    font-size: 9pt;
}

.my-custom-btn {
    background: var(--sdpi-buttonbackgroundcolor);
    color: var(--sdpi-buttonforegroundcolor);
    border: 1px solid var(--sdpi-border);
    border-radius: 3px;
    padding: 4px 12px;
    cursor: pointer;
}

.my-custom-btn:hover {
    background: var(--sdpi-highlights);
}
```

### Responsive Layout

The PI panel has a fixed width (~320px). Design for this constraint:

```css
.sdpi-wrapper {
    max-width: 320px;
    box-sizing: border-box;
    padding: 8px;
}

.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}
```

## Performance

### Lazy Loading Remote Data

Don't fetch data on load if not immediately needed:

```javascript
let dataLoaded = false;

document.getElementById("dropdown-trigger").addEventListener("focus", async () => {
    if (dataLoaded) return;
    dataLoaded = true;
    const options = await fetchOptions();
    populateDropdown(options);
});
```

### Handling Large Lists with Windowing

For lists with hundreds of items, only render visible rows:

```javascript
class VirtualList {
    constructor(container, itemHeight, items, renderItem) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.items = items;
        this.renderItem = renderItem;
        this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
        container.style.position = "relative";
        container.style.overflowY = "auto";
        container.style.height = `${Math.min(items.length * itemHeight, 200)}px`;

        const inner = document.createElement("div");
        inner.style.height = `${items.length * itemHeight}px`;
        container.appendChild(inner);
        this.inner = inner;

        container.addEventListener("scroll", () => this.render());
        this.render();
    }

    render() {
        const scrollTop = this.container.scrollTop;
        const startIndex = Math.floor(scrollTop / this.itemHeight);
        const endIndex = Math.min(startIndex + this.visibleCount, this.items.length);

        this.inner.innerHTML = "";
        for (let i = startIndex; i < endIndex; i++) {
            const el = this.renderItem(this.items[i], i);
            el.style.position = "absolute";
            el.style.top = `${i * this.itemHeight}px`;
            el.style.height = `${this.itemHeight}px`;
            this.inner.appendChild(el);
        }
    }
}
```

## Testing Property Inspectors

### Manual Testing

Open `http://localhost:23654/` in Chrome while Stream Deck is running to view and inspect all loaded PI pages.

### Automated Testing with jsdom

```javascript
// pi.test.js (Jest)
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const html = readFileSync("src/property-inspector.html", "utf-8");

describe("Property Inspector", () => {
    let dom;
    beforeEach(() => {
        dom = new JSDOM(html, { runScripts: "dangerously" });
    });

    it("shows URL field when mode is remote", () => {
        const { document } = dom.window;
        const modeSelect = document.getElementById("mode-select");
        modeSelect.value = "remote";
        modeSelect.dispatchEvent(new dom.window.Event("change"));
        expect(document.getElementById("url-group").style.display).not.toBe("none");
    });
});
```

## Best Practices

1. **Always read settings on load** — call `getSettings()` on `DOMContentLoaded`
2. **Debounce text input** — don't call `setSettings()` on every keystroke; debounce 300–500ms
3. **Show validation errors inline** — don't rely on browser `alert()`
4. **Use SDPI Components for standard fields** — only reach for custom HTML for genuinely unsupported patterns
5. **Keep PI lightweight** — avoid heavy frameworks (React, Vue) unless the PI is very complex; they add load time
6. **Test dark and light themes** — Stream Deck supports both; use `var(--sdpi-*)` variables
7. **Handle the `didReceiveSettings` event** — settings can be reset externally (e.g., profile switch)
8. **Use `sendToPropertyInspector`** to push live status data from plugin to PI
9. **Avoid inline event handlers** (`onclick="..."`) — use `addEventListener` for cleaner code
10. **Keyboard-accessible custom controls** — test your PI using only the keyboard

---

**Related Documentation**:
- [Property Inspector Basics](../ui-components/property-inspector-basics.md)
- [Form Components](../ui-components/form-components.md)
- [Property Inspector Templates](../code-templates/property-inspector-templates.md)
