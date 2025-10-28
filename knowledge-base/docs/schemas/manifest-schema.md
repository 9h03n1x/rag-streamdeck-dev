# manifest.json Schema Reference

The manifest.json file is the core configuration file for every Stream Deck plugin.

## Complete Schema

```json
{
  "Name": "string (required)",
  "Version": "string (required, semver format)",
  "Author": "string (required)",
  "Actions": [
    {
      "Name": "string (required)",
      "UUID": "string (required, reverse domain notation)",
      "Icon": "string (required, relative path without extension)",
      "Tooltip": "string (optional)",
      "PropertyInspectorPath": "string (optional, relative path)",
      "States": [
        {
          "Image": "string (required, relative path without extension)",
          "MultiActionImage": "string (optional)",
          "Name": "string (optional)",
          "Title": "string (optional)",
          "ShowTitle": true,
          "TitleColor": "string (optional, hex color)",
          "TitleAlignment": "string (optional: top|middle|bottom)",
          "FontFamily": "string (optional)",
          "FontSize": "string (optional)",
          "FontStyle": "string (optional: Regular|Bold|Italic|Bold Italic)",
          "FontUnderline": false
        }
      ],
      "SupportedInMultiActions": true,
      "Controllers": ["string (Keypad|Encoder)"],
      "Encoder": {
        "Icon": "string (optional)",
        "background": "string (optional)",
        "TriggerDescription": {
          "Rotate": "string (optional)",
          "Push": "string (optional)",
          "Touch": "string (optional)",
          "LongTouch": "string (optional)"
        }
      },
      "UserTitleEnabled": true,
      "VisibleInActionsList": true,
      "DisableAutomaticStates": false
    }
  ],
  "Category": "string (optional)",
  "CategoryIcon": "string (optional, relative path without extension)",
  "CodePath": "string (required, relative path to executable)",
  "CodePathMac": "string (optional, macOS-specific executable)",
  "CodePathWin": "string (optional, Windows-specific executable)",
  "Description": "string (required)",
  "Icon": "string (required, relative path without extension)",
  "URL": "string (optional, plugin website)",
  "SDKVersion": 2,
  "Software": {
    "MinimumVersion": "string (required, e.g., '4.1')"
  },
  "OS": [
    {
      "Platform": "string (required: mac|windows)",
      "MinimumVersion": "string (required)"
    }
  ],
  "Nodejs": {
    "Version": "string (optional, e.g., '16')",
    "Debug": "string (optional, debug flags)"
  },
  "ApplicationsToMonitor": {
    "mac": ["string (bundle identifier)"],
    "windows": ["string (executable name)"]
  },
  "Profiles": [
    {
      "Name": "string (required)",
      "DeviceType": 0,
      "ReadOnly": false,
      "DontAutoSwitchWhenInstalled": false
    }
  ],
  "DefaultWindowSize": [width, height],
  "PropertyInspectorPath": "string (optional, shared PI path)"
}
```

## Field Details

### Root Level Fields

#### Name (required)
- Type: `string`
- Description: The name of the plugin as displayed in Stream Deck
- Example: `"My Awesome Plugin"`

#### Version (required)
- Type: `string`
- Description: Plugin version in semantic versioning format
- Example: `"1.0.0"`, `"2.3.1-beta"`

#### Author (required)
- Type: `string`
- Description: Name of the plugin author or organization
- Example: `"Your Name"`, `"Example Corp"`

#### Description (required)
- Type: `string`
- Description: Brief description of the plugin's functionality
- Example: `"Control your smart home devices from Stream Deck"`

#### Icon (required)
- Type: `string`
- Description: Path to plugin icon (without @2x or extension)
- Example: `"images/plugin-icon"`
- Note: Provide both `icon.png` (72x72) and `icon@2x.png` (144x144)

#### CodePath (required)
- Type: `string`
- Description: Relative path to the plugin executable
- Example: `"plugin.js"` (Node.js), `"plugin.exe"` (Windows binary), `"plugin"` (macOS binary)

#### CodePathMac (optional)
- Type: `string`
- Description: macOS-specific executable path
- Example: `"bin/plugin-mac"`

#### CodePathWin (optional)
- Type: `string`
- Description: Windows-specific executable path
- Example: `"bin/plugin.exe"`

#### Category (optional)
- Type: `string`
- Description: Category name for grouping actions
- Example: `"Social Media"`, `"Productivity"`, `"Custom"`

#### CategoryIcon (optional)
- Type: `string`
- Description: Path to category icon (without @2x or extension)
- Example: `"images/category-icon"`

#### URL (optional)
- Type: `string`
- Description: Plugin website or support URL
- Example: `"https://example.com/my-plugin"`

#### SDKVersion (required)
- Type: `number`
- Description: Stream Deck SDK version
- Value: `2` (current version)

#### Software (required)
- Type: `object`
- Description: Minimum Stream Deck software version requirements
- Example:
  ```json
  {
    "MinimumVersion": "4.1"
  }
  ```

#### OS (required)
- Type: `array`
- Description: Supported operating systems and their minimum versions
- Example:
  ```json
  [
    {
      "Platform": "mac",
      "MinimumVersion": "10.11"
    },
    {
      "Platform": "windows",
      "MinimumVersion": "10"
    }
  ]
  ```

### Action Fields

#### Name (required)
- Type: `string`
- Description: Action name displayed in Stream Deck
- Example: `"Toggle Light"`, `"Send Tweet"`

#### UUID (required)
- Type: `string`
- Description: Unique identifier using reverse domain notation
- Format: `com.author.plugin.action`
- Example: `"com.example.smartlights.toggle"`

#### Icon (required)
- Type: `string`
- Description: Path to action icon (without @2x or extension)
- Example: `"images/action-icon"`

#### Tooltip (optional)
- Type: `string`
- Description: Tooltip text shown on hover
- Example: `"Press to toggle the light on/off"`

#### PropertyInspectorPath (optional)
- Type: `string`
- Description: Path to property inspector HTML file
- Example: `"propertyinspector/action.html"`

#### States (required)
- Type: `array`
- Description: Array of state definitions (at least one required)
- Single state for regular actions, multiple states for toggles
- Example:
  ```json
  [
    {
      "Image": "images/off-state",
      "Name": "Off"
    },
    {
      "Image": "images/on-state",
      "Name": "On"
    }
  ]
  ```

##### State Properties

- **Image** (required): Path to state image (without @2x or extension)
- **MultiActionImage** (optional): Different image when used in multi-action
- **Name** (optional): State name for identification
- **Title** (optional): Default title text
- **ShowTitle** (optional): Whether to show title (default: true)
- **TitleColor** (optional): Hex color for title (e.g., `"#ffffff"`)
- **TitleAlignment** (optional): Title vertical alignment (`"top"`, `"middle"`, `"bottom"`)
- **FontFamily** (optional): Font family name
- **FontSize** (optional): Font size as string (e.g., `"12"`)
- **FontStyle** (optional): Font style (`"Regular"`, `"Bold"`, `"Italic"`, `"Bold Italic"`)
- **FontUnderline** (optional): Whether to underline text (default: false)

#### SupportedInMultiActions (optional)
- Type: `boolean`
- Description: Whether action can be used in multi-actions
- Default: `true`

#### Controllers (required)
- Type: `array`
- Description: Supported Stream Deck controllers
- Values: `["Keypad"]`, `["Encoder"]`, or `["Keypad", "Encoder"]`
- Example: `["Keypad"]`

#### Encoder (optional)
- Type: `object`
- Description: Configuration for encoder support (Stream Deck+)
- Example:
  ```json
  {
    "Icon": "images/encoder-icon",
    "background": "images/encoder-bg",
    "TriggerDescription": {
      "Rotate": "Adjust volume",
      "Push": "Mute/unmute",
      "Touch": "Show details",
      "LongTouch": "Open settings"
    }
  }
  ```

#### UserTitleEnabled (optional)
- Type: `boolean`
- Description: Whether users can customize the title
- Default: `true`

#### VisibleInActionsList (optional)
- Type: `boolean`
- Description: Whether action appears in the actions list
- Default: `true`

#### DisableAutomaticStates (optional)
- Type: `boolean`
- Description: Disable automatic state switching
- Default: `false`

### Advanced Fields

#### Nodejs (optional)
- Type: `object`
- Description: Node.js configuration
- Example:
  ```json
  {
    "Version": "16",
    "Debug": "enabled"
  }
  ```

#### ApplicationsToMonitor (optional)
- Type: `object`
- Description: Applications to monitor for launch/termination events
- Example:
  ```json
  {
    "mac": ["com.spotify.client"],
    "windows": ["spotify.exe"]
  }
  ```

#### Profiles (optional)
- Type: `array`
- Description: Pre-configured profiles to install with plugin
- Example:
  ```json
  [
    {
      "Name": "Default Profile",
      "DeviceType": 0,
      "ReadOnly": false,
      "DontAutoSwitchWhenInstalled": false
    }
  ]
  ```

##### Device Types
- `0`: Stream Deck (15 keys: 5x3)
- `1`: Stream Deck Mini (6 keys: 3x2)
- `2`: Stream Deck XL (32 keys: 8x4)
- `3`: Stream Deck Mobile
- `4`: Corsair GKeys

#### DefaultWindowSize (optional)
- Type: `array`
- Description: Default size for property inspector window [width, height]
- Example: `[300, 400]`

## Complete Example

```json
{
  "Name": "Smart Home Control",
  "Version": "1.0.0",
  "Author": "Example Corp",
  "Actions": [
    {
      "Name": "Toggle Light",
      "UUID": "com.example.smarthome.togglelight",
      "Icon": "images/light",
      "Tooltip": "Toggle smart light on/off",
      "PropertyInspectorPath": "propertyinspector/light.html",
      "States": [
        {
          "Image": "images/light-off",
          "Name": "Off"
        },
        {
          "Image": "images/light-on",
          "Name": "On"
        }
      ],
      "SupportedInMultiActions": true,
      "Controllers": ["Keypad"]
    },
    {
      "Name": "Brightness Control",
      "UUID": "com.example.smarthome.brightness",
      "Icon": "images/brightness",
      "Tooltip": "Adjust light brightness",
      "PropertyInspectorPath": "propertyinspector/brightness.html",
      "States": [
        {
          "Image": "images/brightness"
        }
      ],
      "Controllers": ["Keypad", "Encoder"],
      "Encoder": {
        "Icon": "images/encoder-brightness",
        "TriggerDescription": {
          "Rotate": "Adjust brightness",
          "Push": "Toggle on/off"
        }
      }
    }
  ],
  "Category": "Smart Home",
  "CategoryIcon": "images/category",
  "CodePath": "plugin.js",
  "Description": "Control your smart home devices from Stream Deck",
  "Icon": "images/plugin-icon",
  "URL": "https://example.com/smart-home-plugin",
  "SDKVersion": 2,
  "Software": {
    "MinimumVersion": "4.1"
  },
  "OS": [
    {
      "Platform": "mac",
      "MinimumVersion": "10.11"
    },
    {
      "Platform": "windows",
      "MinimumVersion": "10"
    }
  ],
  "Nodejs": {
    "Version": "16"
  },
  "ApplicationsToMonitor": {
    "mac": [],
    "windows": []
  }
}
```

## Validation

Use a JSON validator to ensure your manifest is valid JSON. Common issues:
- Missing commas between array elements
- Trailing commas (not allowed in JSON)
- Missing required fields
- Incorrect data types
- Invalid UUID format

## Best Practices

1. Use semantic versioning for the Version field
2. Keep Names and Descriptions concise and clear
3. Use consistent UUID naming (reverse domain notation)
4. Always provide @2x images for high-DPI displays
5. Set appropriate minimum software and OS versions
6. Include both Keypad and Encoder support when relevant
7. Enable SupportedInMultiActions when possible
8. Provide clear Tooltips for all actions
