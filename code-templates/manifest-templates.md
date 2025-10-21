# Manifest Templates

## Basic Plugin Manifest

```json
{
  "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
  "UUID": "com.company.pluginname",
  "Name": "Plugin Name",
  "Version": "1.0.0.0",
  "Author": "Your Company",
  "Description": "Plugin description",
  "Category": "Category Name",
  "CategoryIcon": "imgs/category-icon",
  "Icon": "imgs/plugin-icon",
  "CodePath": "bin/plugin.js",
  "SDKVersion": 2,
  "Software": {
    "MinimumVersion": "6.6"
  },
  "OS": [
    {
      "Platform": "mac",
      "MinimumVersion": "10.15"
    },
    {
      "Platform": "windows",
      "MinimumVersion": "10"
    }
  ],
  "Nodejs": {
    "Version": "20",
    "Debug": "enabled"
  },
  "Actions": [
    {
      "Name": "Action Name",
      "UUID": "com.company.pluginname.action",
      "Icon": "imgs/actions/action/icon",
      "Tooltip": "Action description",
      "Controllers": ["Keypad"],
      "States": [
        {
          "Image": "imgs/actions/action/key"
        }
      ]
    }
  ]
}
```

## Multi-Action Plugin

```json
{
  "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
  "UUID": "com.company.plugin",
  "Name": "Multi-Action Plugin",
  "Version": "1.0.0.0",
  "Actions": [
    {
      "Name": "Action One",
      "UUID": "com.company.plugin.action1",
      "Icon": "imgs/actions/action1/icon",
      "Controllers": ["Keypad"],
      "PropertyInspectorPath": "ui/action1.html",
      "States": [{
        "Image": "imgs/actions/action1/key"
      }]
    },
    {
      "Name": "Action Two",
      "UUID": "com.company.plugin.action2",
      "Icon": "imgs/actions/action2/icon",
      "Controllers": ["Keypad", "Encoder"],
      "PropertyInspectorPath": "ui/action2.html",
      "States": [{
        "Image": "imgs/actions/action2/key"
      }],
      "Encoder": {
        "layout": "$B1"
      }
    }
  ]
}
```

## Multi-State Action

```json
{
  "Actions": [
    {
      "Name": "Toggle",
      "UUID": "com.company.plugin.toggle",
      "Icon": "imgs/actions/toggle/icon",
      "Controllers": ["Keypad"],
      "States": [
        {
          "Image": "imgs/actions/toggle/off",
          "Name": "Off",
          "TitleAlignment": "middle"
        },
        {
          "Image": "imgs/actions/toggle/on",
          "Name": "On",
          "TitleAlignment": "middle"
        }
      ]
    }
  ]
}
```

## Dial Action (Stream Deck +)

```json
{
  "Actions": [
    {
      "Name": "Volume",
      "UUID": "com.company.plugin.volume",
      "Icon": "imgs/actions/volume/icon",
      "Controllers": ["Encoder"],
      "Encoder": {
        "layout": "$B1",
        "TriggerDescription": {
          "Rotate": "Adjust volume",
          "Push": "Mute/Unmute",
          "Touch": "Show details",
          "LongTouch": "Settings"
        }
      },
      "States": [{
        "Image": "imgs/actions/volume/dial"
      }]
    }
  ]
}
```

## With Application Monitoring

```json
{
  "ApplicationsToMonitor": {
    "mac": [
      "com.spotify.client",
      "com.apple.Music"
    ],
    "windows": [
      "Spotify.exe",
      "Music.exe"
    ]
  }
}
```

## With Profiles

```json
{
  "Profiles": [
    {
      "Name": "Default Profile",
      "DeviceType": 0,
      "Readonly": false,
      "DontAutoSwitchWhenInstalled": false,
      "AutoInstall": true
    }
  ]
}
```

## Complete Example

```json
{
  "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
  "UUID": "com.company.production-plugin",
  "Name": "Production Plugin",
  "Version": "2.1.0.0",
  "Author": "Company Name",
  "Description": "Professional plugin with multiple actions",
  "Category": "Utilities",
  "CategoryIcon": "imgs/category",
  "Icon": "imgs/marketplace",
  "CodePath": "bin/plugin.js",
  "PropertyInspectorPath": "ui/default.html",
  "SDKVersion": 2,
  "Software": {
    "MinimumVersion": "6.6"
  },
  "OS": [
    {
      "Platform": "mac",
      "MinimumVersion": "10.15"
    },
    {
      "Platform": "windows",
      "MinimumVersion": "10"
    }
  ],
  "Nodejs": {
    "Version": "20",
    "Debug": "enabled"
  },
  "ApplicationsToMonitor": {
    "mac": ["com.app.bundle"],
    "windows": ["App.exe"]
  },
  "Actions": [
    {
      "Name": "Main Action",
      "UUID": "com.company.production-plugin.main",
      "Icon": "imgs/actions/main/icon",
      "Tooltip": "Main action tooltip",
      "Controllers": ["Keypad", "Encoder"],
      "PropertyInspectorPath": "ui/main.html",
      "States": [{
        "Image": "imgs/actions/main/key",
        "TitleAlignment": "middle"
      }],
      "Encoder": {
        "layout": "$B1"
      }
    }
  ],
  "Profiles": [
    {
      "Name": "Default Setup",
      "DeviceType": 0,
      "AutoInstall": true
    }
  ]
}
```
