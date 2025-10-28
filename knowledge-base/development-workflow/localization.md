---
category: development-workflow
title: Localization and Internationalization Guide
tags: [localization, i18n, internationalization, multi-language, translation, manifest]
difficulty: intermediate
sdk-version: v2
related-files: [manifest-templates.md, property-inspector-basics.md, environment-setup.md]
description: Complete guide to implementing multi-language support in Stream Deck plugins using the i18n system
---

# Localization and Internationalization Guide

## Overview

Stream Deck plugins support full internationalization (i18n) with built-in localization features. The SDK provides a comprehensive i18n system that handles translation loading, fallback languages, and dynamic language switching.

## Supported Languages

Stream Deck officially supports the following languages:

```typescript
// Supported languages in Stream Deck
const supportedLanguages = [
    "de",     // German
    "en",     // English (default/fallback)
    "es",     // Spanish  
    "fr",     // French
    "ja",     // Japanese
    "ko",     // Korean
    "zh_CN",  // Chinese (Simplified)
    "zh_TW"   // Chinese (Traditional)
] as const;
```

## File Structure for Localization

### Translation Files Location

Place translation files in your plugin's **root directory** (same level as `manifest.json`):

```
my-plugin/
├── *.sdPlugin/
│   ├── bin/
│   ├── imgs/
│   ├── ui/
│   └── manifest.json
├── src/
├── en.json          # English (default)
├── de.json          # German
├── es.json          # Spanish
├── fr.json          # French
├── ja.json          # Japanese
├── ko.json          # Korean
├── zh_CN.json       # Chinese (Simplified)
└── zh_TW.json       # Chinese (Traditional)
```

### Translation File Format

**Required Structure:** All translations must be nested under a `"Localization"` object:

```json
// en.json (English - Default/Fallback)
{
  "Localization": {
    "Actions": {
      "Counter": {
        "Name": "Counter",
        "Tooltip": "Increment counter on key press"
      },
      "Timer": {
        "Name": "Timer", 
        "Tooltip": "Start/stop timer"
      }
    },
    "PropertyInspector": {
      "Settings": "Settings",
      "CounterLabel": "Counter Value",
      "ResetButton": "Reset Counter",
      "TimerDuration": "Timer Duration (seconds)"
    },
    "Messages": {
      "Success": "Operation completed successfully",
      "Error": "An error occurred",
      "Connecting": "Connecting...",
      "Connected": "Connected"
    },
    "Common": {
      "Save": "Save",
      "Cancel": "Cancel", 
      "OK": "OK",
      "Apply": "Apply"
    }
  }
}
```

```json
// de.json (German)
{
  "Localization": {
    "Actions": {
      "Counter": {
        "Name": "Zähler",
        "Tooltip": "Zähler bei Tastendruck erhöhen"
      },
      "Timer": {
        "Name": "Timer",
        "Tooltip": "Timer starten/stoppen"
      }
    },
    "PropertyInspector": {
      "Settings": "Einstellungen",
      "CounterLabel": "Zählerwert", 
      "ResetButton": "Zähler zurücksetzen",
      "TimerDuration": "Timer-Dauer (Sekunden)"
    },
    "Messages": {
      "Success": "Vorgang erfolgreich abgeschlossen",
      "Error": "Ein Fehler ist aufgetreten",
      "Connecting": "Verbinde...",
      "Connected": "Verbunden"
    },
    "Common": {
      "Save": "Speichern",
      "Cancel": "Abbrechen",
      "OK": "OK", 
      "Apply": "Anwenden"
    }
  }
}
```

### Nested Translation Keys

Use nested objects for better organization:

```json
{
  "Localization": {
    "Settings": {
      "Audio": {
        "Volume": "Volume",
        "Mute": "Mute",
        "Device": {
          "Input": "Input Device",
          "Output": "Output Device"
        }
      },
      "Video": {
        "Resolution": "Resolution", 
        "Quality": "Quality"
      }
    }
  }
}
```

## Using Localization in Plugin Code

### Accessing the i18n System

```typescript
import streamDeck from "@elgato/streamdeck";

// Get the i18n provider
const i18n = streamDeck.i18n;
```

### Basic Translation

```typescript
import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

@action({ UUID: "com.example.counter" })
export class CounterAction extends SingletonAction {
    override async onKeyDown(ev: KeyDownEvent): Promise<void> {
        // Translate using current user's language
        const actionName = streamDeck.i18n.translate("Actions.Counter.Name");
        
        // Use the 't' alias for shorter syntax
        const tooltip = streamDeck.i18n.t("Actions.Counter.Tooltip");
        
        // Update action with localized text
        await ev.action.setTitle(actionName);
    }
}
```

### Explicit Language Translation

```typescript
// Translate to specific language
const germanName = streamDeck.i18n.translate("Actions.Counter.Name", "de");
const englishName = streamDeck.i18n.translate("Actions.Counter.Name", "en");
```

### Fallback Behavior

The i18n system provides automatic fallbacks:

```typescript
// If key doesn't exist in user's language, falls back to English
// If key doesn't exist in English, returns the key itself
const translation = streamDeck.i18n.t("NonExistent.Key"); 
// Returns: "NonExistent.Key"
```

### Dynamic Language Detection

```typescript
// Get user's current language from Stream Deck
const userLanguage = streamDeck.info.application.language;
console.log(`User language: ${userLanguage}`); // e.g., "de", "en", "fr"

// Translate based on detected language
const localizedText = streamDeck.i18n.t("Messages.Welcome");
```

## Property Inspector Localization

### HTML Structure with Localization

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <script src="sdpi-components.js"></script>
</head>
<body>
    <sdpi-item>
        <sdpi-label id="settingsLabel">Settings</sdpi-label>
    </sdpi-item>
    
    <sdpi-item>
        <sdpi-label id="counterLabel">Counter Value</sdpi-label>
        <sdpi-textfield setting="counterValue" placeholder="0"></sdpi-textfield>
    </sdpi-item>
    
    <sdpi-item>
        <sdpi-button id="resetButton">Reset Counter</sdpi-button>
    </sdpi-item>

    <script>
        const { streamDeckClient } = SDPIComponents;
        
        // Localize UI on load
        document.addEventListener('DOMContentLoaded', () => {
            localizeUI();
        });
        
        async function localizeUI() {
            // Request translations from plugin
            streamDeckClient.sendToPlugin({
                event: 'requestTranslations'
            });
        }
        
        // Receive translations from plugin
        streamDeckClient.on('sendToPropertyInspector', (event) => {
            if (event.event === 'translations') {
                updateUIText(event.translations);
            }
        });
        
        function updateUIText(translations) {
            document.getElementById('settingsLabel').textContent = 
                translations.settingsLabel || 'Settings';
            document.getElementById('counterLabel').textContent = 
                translations.counterLabel || 'Counter Value';
            document.getElementById('resetButton').textContent = 
                translations.resetButton || 'Reset Counter';
        }
    </script>
</body>
</html>
```

### Plugin-Side Translation for UI

```typescript
import { action, SendToPluginEvent, SingletonAction } from "@elgato/streamdeck";

@action({ UUID: "com.example.counter" })
export class CounterAction extends SingletonAction {
    override async onSendToPlugin(ev: SendToPluginEvent): Promise<void> {
        if (ev.payload.event === 'requestTranslations') {
            // Send localized strings to Property Inspector
            const translations = {
                settingsLabel: streamDeck.i18n.t("PropertyInspector.Settings"),
                counterLabel: streamDeck.i18n.t("PropertyInspector.CounterLabel"), 
                resetButton: streamDeck.i18n.t("PropertyInspector.ResetButton")
            };
            
            await ev.action.sendToPropertyInspector({
                event: 'translations',
                translations
            });
        }
    }
}
```

## Manifest Localization

### Action Names and Tooltips

Unfortunately, the `manifest.json` file itself **cannot be localized directly**. However, you can update action names dynamically:

```typescript
// In action's onWillAppear
override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    // Set localized action name (this affects the action list)
    const localizedName = streamDeck.i18n.t("Actions.Counter.Name");
    
    // Note: This doesn't change the manifest, but can update display
    await ev.action.setTitle(localizedName);
}
```

### Workaround for Action Names

For marketplace distribution, use English names in the manifest and provide translations through other means:

```json
// manifest.json
{
  "Actions": [
    {
      "Name": "Counter", // Always English for marketplace
      "UUID": "com.example.counter",
      "Tooltip": "Increment counter on key press"
    }
  ]
}
```

## Best Practices

### 1. Translation Key Organization

```typescript
// Use hierarchical keys
const keyPatterns = {
    good: "Actions.Counter.Name",
    good: "PropertyInspector.Settings.Volume", 
    good: "Messages.Error.Connection",
    
    poor: "counter_name",
    poor: "volume_setting",
    poor: "connection_error"
};
```

### 2. Provide Complete English Fallback

Always provide complete English translations as the fallback:

```json
// en.json - Must be complete
{
  "Localization": {
    "Actions": {
      "Counter": {
        "Name": "Counter",
        "Tooltip": "Increment counter"
      }
    }
  }
}
```

### 3. Handle Missing Translations Gracefully

```typescript
// Safe translation with fallback
function safeTranslate(key: string, fallback?: string): string {
    const translated = streamDeck.i18n.t(key);
    
    // If translation returned the key (not found), use fallback
    if (translated === key && fallback) {
        return fallback;
    }
    
    return translated;
}

// Usage
const title = safeTranslate("Actions.Unknown.Name", "Default Action");
```

### 4. Context-Aware Translations

```json
{
  "Localization": {
    "Actions": {
      "Play": {
        "Music": "Play Music",
        "Video": "Play Video", 
        "Game": "Launch Game"
      }
    },
    "States": {
      "Play": "Play",
      "Playing": "Playing", 
      "Pause": "Pause",
      "Paused": "Paused"
    }
  }
}
```

### 5. Testing Localization

```typescript
// Test all supported languages
const testTranslations = () => {
    const supportedLanguages = ["de", "en", "es", "fr", "ja", "ko", "zh_CN", "zh_TW"];
    const testKeys = ["Actions.Counter.Name", "Messages.Success"];
    
    supportedLanguages.forEach(lang => {
        testKeys.forEach(key => {
            const translation = streamDeck.i18n.translate(key, lang);
            console.log(`${lang}: ${key} = ${translation}`);
        });
    });
};
```

## Advanced Localization Patterns

### 1. Dynamic Text with Placeholders

While the SDK doesn't provide built-in placeholder support, you can implement it:

```typescript
function translateWithPlaceholders(key: string, replacements: Record<string, string>): string {
    let translated = streamDeck.i18n.t(key);
    
    // Replace placeholders like {username}, {count}
    Object.entries(replacements).forEach(([placeholder, value]) => {
        translated = translated.replace(new RegExp(`{${placeholder}}`, 'g'), value);
    });
    
    return translated;
}

// Usage with JSON like: "Welcome back, {username}!"
const message = translateWithPlaceholders("Messages.Welcome", { 
    username: "John" 
});
```

### 2. Pluralization Helper

```typescript
function translatePlural(baseKey: string, count: number): string {
    const singularKey = `${baseKey}.Singular`;
    const pluralKey = `${baseKey}.Plural`;
    
    if (count === 1) {
        return streamDeck.i18n.t(singularKey);
    } else {
        return streamDeck.i18n.t(pluralKey);
    }
}

// JSON structure:
// "Items": {
//   "Singular": "1 item",
//   "Plural": "{count} items"
// }
```

### 3. Date and Number Formatting

```typescript
function formatNumber(num: number, locale?: string): string {
    const userLocale = locale || streamDeck.info.application.language;
    
    // Map Stream Deck language codes to locale codes
    const localeMap: Record<string, string> = {
        'en': 'en-US',
        'de': 'de-DE', 
        'fr': 'fr-FR',
        'es': 'es-ES',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh_CN': 'zh-CN',
        'zh_TW': 'zh-TW'
    };
    
    return new Intl.NumberFormat(localeMap[userLocale] || 'en-US').format(num);
}

function formatDate(date: Date, locale?: string): string {
    const userLocale = locale || streamDeck.info.application.language;
    const localeMap = { /* same as above */ };
    
    return new Intl.DateTimeFormat(localeMap[userLocale] || 'en-US').format(date);
}
```

## Troubleshooting

### Common Issues

#### 1. Translations Not Loading

```typescript
// Check if translation file exists and has correct structure
const testTranslation = streamDeck.i18n.t("test.key");
if (testTranslation === "test.key") {
    console.log("Translation not found - check file structure");
}
```

#### 2. File Structure Validation

```json
// ❌ WRONG - Missing Localization wrapper
{
  "Actions": {
    "Counter": "Counter"
  }
}

// ✅ CORRECT - Proper structure  
{
  "Localization": {
    "Actions": {
      "Counter": "Counter"
    }
  }
}
```

#### 3. File Encoding Issues

Ensure all translation files are saved as **UTF-8** to support international characters:

```json
{
  "Localization": {
    "Messages": {
      "Chinese": "你好世界",
      "Japanese": "こんにちは世界", 
      "Korean": "안녕하세요 세계",
      "German": "Hällö Wörld",
      "French": "Bonjour Monde"
    }
  }
}
```

### Debug Translation Loading

```typescript
// Add to plugin initialization
console.log('User language:', streamDeck.info.application.language);

// Test key translation
const testKey = "Actions.Counter.Name";
console.log('English:', streamDeck.i18n.translate(testKey, "en"));
console.log('German:', streamDeck.i18n.translate(testKey, "de"));
console.log('User lang:', streamDeck.i18n.translate(testKey));
```

## Example: Complete Localized Plugin

### File Structure
```
counter-plugin/
├── com.example.counter.sdPlugin/
├── src/
├── en.json
├── de.json
└── package.json
```

### Translation Files

**en.json:**
```json
{
  "Localization": {
    "Action": {
      "Name": "Counter",
      "Tooltip": "Increment counter on press"
    },
    "UI": {
      "Settings": "Settings",
      "CurrentValue": "Current Value",
      "Reset": "Reset"
    },
    "Messages": {
      "Reset": "Counter reset to 0",
      "Incremented": "Counter: {count}"
    }
  }
}
```

**de.json:**
```json
{
  "Localization": {
    "Action": {
      "Name": "Zähler", 
      "Tooltip": "Zähler bei Druck erhöhen"
    },
    "UI": {
      "Settings": "Einstellungen",
      "CurrentValue": "Aktueller Wert",
      "Reset": "Zurücksetzen"  
    },
    "Messages": {
      "Reset": "Zähler auf 0 zurückgesetzt",
      "Incremented": "Zähler: {count}"
    }
  }
}
```

### Action Implementation

```typescript
import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

interface CounterSettings {
    count: number;
}

@action({ UUID: "com.example.counter" }) 
export class CounterAction extends SingletonAction<CounterSettings> {
    
    override async onWillAppear(ev: WillAppearEvent<CounterSettings>): Promise<void> {
        const { count = 0 } = ev.payload.settings;
        
        // Set localized title
        await this.updateDisplay(ev.action, count);
    }
    
    override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
        let { count = 0 } = ev.payload.settings;
        count++;
        
        // Save new count
        await ev.action.setSettings({ count });
        
        // Update display with localized text
        await this.updateDisplay(ev.action, count);
    }
    
    private async updateDisplay(action: any, count: number): Promise<void> {
        // Get localized counter text
        const counterText = streamDeck.i18n.t("Messages.Incremented")
            .replace('{count}', count.toString());
        
        await action.setTitle(counterText);
    }
}
```

## Performance Considerations

### 1. Lazy Loading
The i18n system loads translations lazily - only when first accessed per language.

### 2. Caching
Translations are cached in memory after first load.

### 3. File Size
Keep translation files reasonable in size (< 50KB per language).

## Distribution and Marketplace

### Marketplace Requirements
- Provide English translations (required)
- Include description of supported languages in plugin description  
- Test with multiple languages before submission

### Version Management
- Update all translation files when adding new keys
- Maintain backward compatibility with existing keys
- Document translation changes in release notes

---

This comprehensive localization system allows Stream Deck plugins to provide native language support for users worldwide, enhancing accessibility and user experience across different regions and languages.