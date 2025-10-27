# Property Inspector Templates

Templates for creating Stream Deck property inspectors using [SDPI Components](https://sdpi-components.dev/). These components are available by default and provide consistent, accessible UI elements.

> 📖 **Official Documentation**: [https://sdpi-components.dev/docs/components](https://sdpi-components.dev/docs/components)

## Basic Form Template

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Action Settings</title>
    <script src="../sdpi-components.js"></script>
    <style>
        body {
            padding: 10px;
        }
        sdpi-item {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <sdpi-item label="Text Input">
        <sdpi-textfield setting="text" placeholder="Enter text"></sdpi-textfield>
    </sdpi-item>
    
    <sdpi-item label="Number">
        <sdpi-textfield setting="number" type="number" min="0" max="100"></sdpi-textfield>
    </sdpi-item>
    
    <sdpi-item label="Enable">
        <sdpi-checkbox setting="enabled"></sdpi-checkbox>
    </sdpi-item>
    
    <sdpi-item label="Options">
        <sdpi-select setting="option">
            <option value="1">Option 1</option>
            <option value="2">Option 2</option>
            <option value="3">Option 3</option>
        </sdpi-select>
    </sdpi-item>
</body>
</html>
```

## Dynamic Content Template

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <script src="../sdpi-components.js"></script>
</head>
<body>
    <sdpi-item label="Category">
        <sdpi-select setting="category" id="category-select" onchange="onCategoryChange()">
            <option value="">Loading...</option>
        </sdpi-select>
    </sdpi-item>
    
    <sdpi-item label="Item">
        <sdpi-select setting="item" id="item-select">
            <option value="">Select category first</option>
        </sdpi-select>
    </sdpi-item>
    
    <script>
        const { streamDeckClient } = SDPIComponents;
        
        // Load categories on init
        streamDeckClient.on('didReceiveSettings', async (settings) => {
            await loadCategories();
            
            if (settings.category) {
                await loadItems(settings.category);
            }
        });
        
        async function loadCategories() {
            const response = await fetch('https://api.example.com/categories');
            const categories = await response.json();
            
            const select = document.getElementById('category-select');
            select.innerHTML = categories.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');
        }
        
        async function loadItems(categoryId) {
            const response = await fetch(`https://api.example.com/items/${categoryId}`);
            const items = await response.json();
            
            const select = document.getElementById('item-select');
            select.innerHTML = items.map(item => 
                `<option value="${item.id}">${item.name}</option>`
            ).join('');
        }
        
        async function onCategoryChange() {
            const select = document.getElementById('category-select');
            await loadItems(select.value);
        }
    </script>
</body>
</html>
```

## Authentication Template

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <script src="../sdpi-components.js"></script>
</head>
<body>
    <div id="login-section">
        <sdpi-item label="API Key">
            <sdpi-password setting="apiKey"></sdpi-password>
        </sdpi-item>
        
        <sdpi-item label="">
            <sdpi-button onclick="testConnection()">
                Test Connection
            </sdpi-button>
        </sdpi-item>
        
        <div id="status"></div>
    </div>
    
    <div id="settings-section" style="display: none;">
        <p>✓ Connected</p>
        
        <sdpi-item label="Setting 1">
            <sdpi-textfield setting="setting1"></sdpi-textfield>
        </sdpi-item>
    </div>
    
    <script>
        const { streamDeckClient } = SDPIComponents;
        
        streamDeckClient.on('didReceiveSettings', async (settings) => {
            if (settings.apiKey && settings.connected) {
                showSettings();
            }
        });
        
        async function testConnection() {
            const settings = await streamDeckClient.getSettings();
            
            try {
                const response = await fetch('https://api.example.com/test', {
                    headers: { 'Authorization': `Bearer ${settings.apiKey}` }
                });
                
                if (response.ok) {
                    await streamDeckClient.setSettings({ 
                        ...settings, 
                        connected: true 
                    });
                    showSettings();
                    document.getElementById('status').innerHTML = 
                        '<span style="color: green;">✓ Connection successful</span>';
                } else {
                    throw new Error('Invalid API key');
                }
            } catch (error) {
                document.getElementById('status').innerHTML = 
                    `<span style="color: red;">✗ ${error.message}</span>`;
            }
        }
        
        function showSettings() {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('settings-section').style.display = 'block';
        }
    </script>
</body>
</html>
```

## Validation Template

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <script src="../sdpi-components.js"></script>
    <style>
        .error {
            color: #ff4444;
            font-size: 12px;
            margin-top: 4px;
        }
    </style>
</head>
<body>
    <form id="settings-form" onsubmit="return false;">
        <sdpi-item label="Email">
            <sdpi-textfield 
                setting="email" 
                type="email" 
                required
                id="email-input"
            ></sdpi-textfield>
            <div id="email-error" class="error"></div>
        </sdpi-item>
        
        <sdpi-item label="Port">
            <sdpi-textfield 
                setting="port" 
                type="number" 
                min="1" 
                max="65535"
                required
                id="port-input"
            ></sdpi-textfield>
            <div id="port-error" class="error"></div>
        </sdpi-item>
        
        <sdpi-item label="">
            <sdpi-button onclick="validateAndSave()">
                Save
            </sdpi-button>
        </sdpi-item>
    </form>
    
    <script>
        const { streamDeckClient } = SDPIComponents;
        
        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        function validatePort(port) {
            const num = parseInt(port);
            return !isNaN(num) && num >= 1 && num <= 65535;
        }
        
        async function validateAndSave() {
            // Clear previous errors
            document.querySelectorAll('.error').forEach(el => el.textContent = '');
            
            const email = document.getElementById('email-input').value;
            const port = document.getElementById('port-input').value;
            
            let valid = true;
            
            if (!validateEmail(email)) {
                document.getElementById('email-error').textContent = 'Invalid email address';
                valid = false;
            }
            
            if (!validatePort(port)) {
                document.getElementById('port-error').textContent = 'Port must be between 1 and 65535';
                valid = false;
            }
            
            if (valid) {
                await streamDeckClient.setSettings({
                    email,
                    port: parseInt(port)
                });
                alert('Settings saved!');
            }
        }
    </script>
</body>
</html>
```
