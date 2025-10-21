# Form Components

The [SDPI Components library](https://sdpi-components.dev/) provides all UI elements needed for Stream Deck property inspectors. These components are available by default and handle automatic synchronization with plugin settings.

> 📖 **Complete Documentation**: For the most up-to-date component reference, visit [https://sdpi-components.dev/docs/components](https://sdpi-components.dev/docs/components)

## Complete Component Reference

### Textfield

```html
<sdpi-item label="Text Input">
    <sdpi-textfield 
        setting="text"
        placeholder="Enter text"
        maxlength="50"
        pattern="[A-Za-z0-9]+"
    ></sdpi-textfield>
</sdpi-item>
```

Attributes:
- `setting`: Settings key
- `placeholder`: Placeholder text
- `maxlength`: Maximum length
- `pattern`: Regex pattern
- `required`: Required field
- `disabled`: Disabled state

### Password

```html
<sdpi-item label="Password">
    <sdpi-password setting="password"></sdpi-password>
</sdpi-item>
```

### Textarea

```html
<sdpi-item label="Description">
    <sdpi-textarea 
        setting="description"
        rows="4"
        maxlength="500"
    ></sdpi-textarea>
</sdpi-item>
```

### Checkbox

```html
<sdpi-item label="Enable">
    <sdpi-checkbox setting="enabled"></sdpi-checkbox>
</sdpi-item>
```

### Radio Buttons

```html
<sdpi-item label="Mode">
    <sdpi-radio setting="mode">
        <option value="auto">Auto</option>
        <option value="manual">Manual</option>
        <option value="custom">Custom</option>
    </sdpi-radio>
</sdpi-item>
```

### Select Dropdown

```html
<sdpi-item label="Category">
    <sdpi-select setting="category">
        <optgroup label="Group 1">
            <option value="1a">Option 1A</option>
            <option value="1b">Option 1B</option>
        </optgroup>
        <optgroup label="Group 2">
            <option value="2a">Option 2A</option>
        </optgroup>
    </sdpi-select>
</sdpi-item>
```

### Checkbox List

```html
<sdpi-item label="Features">
    <sdpi-checkbox-list setting="features">
        <option value="feature1">Feature 1</option>
        <option value="feature2">Feature 2</option>
        <option value="feature3">Feature 3</option>
    </sdpi-checkbox-list>
</sdpi-item>
```

### Range Slider

```html
<sdpi-item label="Volume">
    <sdpi-range 
        setting="volume"
        min="0"
        max="100"
        step="5"
    ></sdpi-range>
</sdpi-item>
```

### Color Picker

```html
<sdpi-item label="Color">
    <sdpi-color setting="color"></sdpi-color>
</sdpi-item>
```

### Date Picker

```html
<sdpi-item label="Date">
    <sdpi-calendar type="date" setting="date"></sdpi-calendar>
</sdpi-item>
```

### Time Picker

```html
<sdpi-item label="Time">
    <sdpi-calendar type="time" setting="time"></sdpi-calendar>
</sdpi-item>
```

### Date-Time Picker

```html
<sdpi-item label="DateTime">
    <sdpi-calendar type="datetime-local" setting="datetime"></sdpi-calendar>
</sdpi-item>
```

### File Upload

```html
<sdpi-item label="Upload">
    <sdpi-file 
        setting="file"
        accept=".jpg,.png"
    ></sdpi-file>
</sdpi-item>
```

### Button

```html
<sdpi-item label="">
    <sdpi-button onclick="handleClick()">
        Click Me
    </sdpi-button>
</sdpi-item>
```

### Week Picker

```html
<sdpi-item label="Week">
    <sdpi-calendar type="week" setting="week"></sdpi-calendar>
</sdpi-item>
```

### Month Picker

```html
<sdpi-item label="Month">
    <sdpi-calendar type="month" setting="month"></sdpi-calendar>
</sdpi-item>
```

### Delegate Component

```html
<sdpi-item label="Custom">
    <sdpi-delegate setting="custom" src="custom-component.html"></sdpi-delegate>
</sdpi-item>
```

## Advanced Patterns

### Conditional Fields

```html
<sdpi-item label="Mode">
    <sdpi-select setting="mode" onchange="updateVisibility()">
        <option value="auto">Auto</option>
        <option value="manual">Manual</option>
    </sdpi-select>
</sdpi-item>

<sdpi-item id="manual-options" style="display: none;" label="Manual Settings">
    <sdpi-textfield setting="manualValue"></sdpi-textfield>
</sdpi-item>

<script>
function updateVisibility() {
    const mode = document.querySelector('sdpi-select[setting="mode"]').value;
    document.getElementById('manual-options').style.display = 
        mode === 'manual' ? 'block' : 'none';
}
</script>
```

### Validation

```javascript
const { streamDeckClient } = SDPIComponents;

function validateForm() {
    const name = document.querySelector('[setting="name"]').value;
    const email = document.querySelector('[setting="email"]').value;
    
    if (!name || name.trim() === '') {
        showError('Name is required');
        return false;
    }
    
    if (!email || !email.includes('@')) {
        showError('Valid email required');
        return false;
    }
    
    return true;
}

function showError(message) {
    alert(message); // Or show in UI
}
```

### Dynamic Options

```javascript
async function loadOptions() {
    const response = await fetch('https://api.example.com/options');
    const options = await response.json();
    
    const select = document.querySelector('sdpi-select[setting="option"]');
    select.innerHTML = options.map(opt => 
        `<option value="${opt.id}">${opt.name}</option>`
    ).join('');
}
```

## Styling Components

```css
/* Custom styles */
sdpi-item {
    margin-bottom: 12px;
}

sdpi-textfield {
    width: 100%;
}

sdpi-button {
    min-width: 100px;
}

/* Custom colors */
sdpi-checkbox[checked] {
    --accent-color: #0066cc;
}
```

## Best Practices

1. **Use `setting` attribute**: Enables automatic synchronization with plugin settings
2. **Provide clear labels**: Use descriptive labels for all form elements
3. **Add validation**: Validate user inputs before saving
4. **Show errors clearly**: Display validation errors in a user-friendly way
5. **Use appropriate input types**: Choose the right component for the data type
6. **Test all form states**: Verify default, loading, error, and success states

## Component Support Matrix

All SDPI Components are supported and maintained by the Stream Deck team. For the complete list of supported components and their properties, see:

- **Component List**: [https://sdpi-components.dev/docs/components](https://sdpi-components.dev/docs/components)
- **Individual Component Docs**: Each component has detailed documentation with examples and properties
- **Getting Started**: [https://sdpi-components.dev/docs/getting-started/get-started](https://sdpi-components.dev/docs/getting-started/get-started)

## Additional Resources

- [SDPI Components Official Site](https://sdpi-components.dev/)
- [Example Property Inspector](https://github.com/GeekyEggo/sdpi-components/blob/main/example/pi/index.html)
- [Stream Deck Developer Documentation](https://docs.elgato.com/streamdeck/sdk/)
