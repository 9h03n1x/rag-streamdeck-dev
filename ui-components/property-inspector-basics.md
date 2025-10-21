# Property Inspector Basics

## Overview

Property Inspectors are HTML-based user interfaces that allow users to configure action settings within Stream Deck. They run in a Chromium-based browser environment.

## File Structure

```
*.sdPlugin/
└── ui/
    ├── action1.html
    ├── action2.html
    └── shared/
        ├── styles.css
        └── common.js
```

## Basic HTML Template

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Action Settings</title>
    <script src="../sdpi-components.js"></script>
</head>
<body>
    <sdpi-item label="Name">
        <sdpi-textfield setting="name"></sdpi-textfield>
    </sdpi-item>
    
    <sdpi-item label="Enabled">
        <sdpi-checkbox setting="enabled"></sdpi-checkbox>
    </sdpi-item>
</body>
</html>
```

## Connecting to Plugin

The sdpi-components library handles connection automatically. Access via:

```javascript
const { streamDeckClient } = SDPIComponents;
```

## Setting Up Property Inspector

### In Manifest

```json
{
  "Actions": [
    {
      "UUID": "com.company.plugin.action",
      "PropertyInspectorPath": "ui/action.html"
    }
  ]
}
```

### Plugin-Level Property Inspector

```json
{
  "PropertyInspectorPath": "ui/default.html",
  "Actions": [
    {
      "UUID": "com.company.plugin.action1"
      // Inherits plugin-level property inspector
    }
  ]
}
```

## Loading sdpi-components

### Local (Recommended)

Download sdpi-components.js and reference locally:

```html
<script src="sdpi-components.js"></script>
```

### Remote (Development Only)

```html
<script src="https://sdpi-components.dev/releases/v4/sdpi-components.js"></script>
```

## Basic Components

### Text Input

```html
<sdpi-item label="Username">
    <sdpi-textfield setting="username" placeholder="Enter username"></sdpi-textfield>
</sdpi-item>
```

### Checkbox

```html
<sdpi-item label="Enable Feature">
    <sdpi-checkbox setting="enabled"></sdpi-checkbox>
</sdpi-item>
```

### Select Dropdown

```html
<sdpi-item label="Theme">
    <sdpi-select setting="theme">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto</option>
    </sdpi-select>
</sdpi-item>
```

### Number Input

```html
<sdpi-item label="Count">
    <sdpi-textfield setting="count" type="number" min="0" max="100"></sdpi-textfield>
</sdpi-item>
```

## Receiving Settings

Settings are automatically loaded when property inspector opens:

```javascript
const { streamDeckClient } = SDPIComponents;

// Listen for settings
streamDeckClient.on('didReceiveSettings', (settings) => {
    console.log('Current settings:', settings);
});
```

## Saving Settings

### Automatic (with setting attribute)

```html
<!-- Automatically syncs -->
<sdpi-textfield setting="name"></sdpi-textfield>
```

### Manual

```javascript
const { streamDeckClient } = SDPIComponents;

await streamDeckClient.setSettings({
    name: "John",
    count: 5,
    enabled: true
});
```

## CSS Styling

sdpi-components provides consistent styling:

```html
<head>
    <style>
        sdpi-item {
            margin-bottom: 10px;
        }
        
        sdpi-textfield {
            width: 100%;
        }
    </style>
</head>
```

## Dynamic Content

```javascript
const { streamDeckClient } = SDPIComponents;

// Load data on init
streamDeckClient.on('didReceiveSettings', async (settings) => {
    const data = await fetchData();
    populateDropdown(data);
});

function populateDropdown(items) {
    const select = document.querySelector('sdpi-select[setting="item"]');
    select.innerHTML = items.map(item => 
        `<option value="${item.id}">${item.name}</option>`
    ).join('');
}
```

## Validation

```javascript
const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.querySelector('sdpi-textfield[setting="name"]').value;
    
    if (!name || name.trim() === '') {
        alert('Name is required');
        return;
    }
    
    await streamDeckClient.setSettings({ name });
});
```

## Best Practices

1. **Local sdpi-components**: Always use local file for production
2. **Auto-save**: Use setting attribute for automatic syncing
3. **Validation**: Validate inputs before saving
4. **Feedback**: Show save confirmation
5. **Loading States**: Show loading indicators
6. **Error Handling**: Display errors clearly
7. **Accessibility**: Use proper labels
