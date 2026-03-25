# Versioning and Migrations

## Overview

Managing plugin versions carefully ensures a smooth experience for users upgrading between releases. This covers semantic versioning in Stream Deck plugins, migrating saved settings schemas, backward compatibility, and rollback procedures.

## Semantic Versioning in Stream Deck

### Version Format

Stream Deck uses a four-part version number in `manifest.json`:

```json
{
    "Version": "MAJOR.MINOR.PATCH.BUILD"
}
```

| Component | When to Increment | Example |
|-----------|-------------------|---------|
| **MAJOR** | Breaking change — old settings are incompatible, or fundamental behavior change | 1.0.0.0 → 2.0.0.0 |
| **MINOR** | New feature added, backward compatible | 1.3.0.0 → 1.4.0.0 |
| **PATCH** | Bug fix, no API or settings changes | 1.3.2.0 → 1.3.3.0 |
| **BUILD** | CI build number; increment on every automated build | 1.3.2.41 → 1.3.2.42 |

**Practical rules:**
- Increment MINOR when adding new settings fields with defaults
- Increment MAJOR when removing or renaming existing settings fields
- Increment PATCH for logic/rendering fixes that don't touch settings
- BUILD is optional but useful for identifying specific CI artifacts

### Storing the Version in Settings

Include a `schemaVersion` field in your action settings type so you can detect and migrate old data:

```typescript
interface Settings {
    schemaVersion: number; // Always include this
    // ... your actual settings
    host: string;
    port: number;
    enabled: boolean;
}

const CURRENT_SCHEMA_VERSION = 3;

const DEFAULT_SETTINGS: Settings = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    host: "localhost",
    port: 8080,
    enabled: true,
};
```

## Settings Schema Migration

### Detecting and Migrating on Load

Run migrations in `onWillAppear` before using settings:

```typescript
@action({ UUID: "com.example.plugin.myaction" })
export class MyAction extends SingletonAction<Settings> {
    override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
        let settings = ev.payload.settings;

        // Migrate if needed
        if (needsMigration(settings)) {
            settings = migrate(settings);
            await ev.action.setSettings(settings);
        }

        await this.applySettings(ev.action, settings);
    }
}
```

### Migration Function

```typescript
function needsMigration(settings: Partial<Settings>): boolean {
    return (settings.schemaVersion ?? 0) < CURRENT_SCHEMA_VERSION;
}

function migrate(raw: Partial<Settings>): Settings {
    let settings = { ...raw };
    const fromVersion = settings.schemaVersion ?? 0;

    // Apply each migration in order
    if (fromVersion < 1) settings = migrateV0toV1(settings);
    if (fromVersion < 2) settings = migrateV1toV2(settings);
    if (fromVersion < 3) settings = migrateV2toV3(settings);

    return settings as Settings;
}

// v0 → v1: "server" field renamed to "host"
function migrateV0toV1(s: any): any {
    return {
        ...s,
        host: s.server ?? "localhost",
        server: undefined,   // remove old field
        schemaVersion: 1,
    };
}

// v1 → v2: "port" was a string, now a number
function migrateV1toV2(s: any): any {
    return {
        ...s,
        port: typeof s.port === "string" ? parseInt(s.port, 10) : (s.port ?? 8080),
        schemaVersion: 2,
    };
}

// v2 → v3: new "enabled" field with default
function migrateV2toV3(s: any): any {
    return {
        ...s,
        enabled: s.enabled ?? true,
        schemaVersion: 3,
    };
}
```

### Migrating Global Settings

Apply the same pattern to global settings, but run it once at plugin startup:

```typescript
// In your main plugin file (entry point)
async function runGlobalMigrations() {
    const raw = await streamDeck.settings.getGlobalSettings<Partial<GlobalSettings>>();
    if ((raw.schemaVersion ?? 0) < CURRENT_GLOBAL_SCHEMA_VERSION) {
        const migrated = migrateGlobalSettings(raw);
        await streamDeck.settings.setGlobalSettings(migrated);
        streamDeck.logger.info(`Global settings migrated to v${CURRENT_GLOBAL_SCHEMA_VERSION}`);
    }
}

streamDeck.actions.registerAction(new MyAction());
await runGlobalMigrations();
streamDeck.connect();
```

## Breaking Changes

### What Constitutes a Breaking Change

| Change | Breaking? | Notes |
|--------|-----------|-------|
| Renaming a settings key | Yes | Old value lost unless migrated |
| Removing a settings key | Yes | Data silently discarded |
| Changing a value's type | Yes | Deserialisation may fail or produce wrong values |
| Adding a new settings key with a default | No | Old settings just won't have the key; use `?? default` |
| Adding a new optional action | No | Doesn't affect existing actions |
| Changing action UUID | Yes | All existing instances break (UUID is immutable) |
| Changing manifest action name | No | Display name only |

### Never Change an Action UUID

The `UUID` field in the manifest is permanent. Changing it causes all existing instances of that action (on user profiles) to become orphaned. If you need to rename an action externally, use the `Name` field; internally the UUID stays the same forever.

### Deprecating a Settings Field

```typescript
interface SettingsV3 {
    schemaVersion: 3;
    host: string;
    port: number;
    enabled: boolean;
    /** @deprecated Use `host` instead — removed in v4 */
    server?: string;
}
```

Keep deprecated fields in the type for one MAJOR version before removing them, to allow users to migrate.

## Backward Compatibility Patterns

### Safe Property Access with Defaults

```typescript
// Always use nullish coalescing for settings fields that may not exist
const host = settings.host ?? "localhost";
const port = settings.port ?? 8080;
const timeout = settings.timeout ?? 5000; // new field in v3
```

### Supporting Multiple Versions Side-by-Side

If you need to support plugin instances created under different schema versions simultaneously (e.g., during a staged rollout), use a version discriminator:

```typescript
type SettingsV1 = { schemaVersion: 1; server: string };
type SettingsV2 = { schemaVersion: 2; host: string; port: number };
type AnySettings = SettingsV1 | SettingsV2 | Settings;

function normalizeSettings(raw: AnySettings): Settings {
    if (!("schemaVersion" in raw) || raw.schemaVersion < 2) {
        return migrate(raw as any);
    }
    return raw as Settings;
}
```

## Update Notifications

### Notifying Users in the Property Inspector

Push version information to the PI when it opens, so you can display a "What's new" banner:

```typescript
// Plugin
override async onPropertyInspectorDidAppear(ev): Promise<void> {
    await ev.action.sendToPropertyInspector({
        type: "version-info",
        currentVersion: "2.0.0",
        changelogUrl: "https://example.com/changelog",
    });
}

// Property Inspector
streamDeckClient.on("sendToPropertyInspector", (msg) => {
    if (msg.type === "version-info" && isNewVersion(msg.currentVersion)) {
        document.getElementById("update-banner").style.display = "block";
        document.getElementById("changelog-link").href = msg.changelogUrl;
        markVersionSeen(msg.currentVersion);
    }
});
```

### Checking for Plugin Updates

For self-hosted update checks (when not using the Marketplace auto-update):

```typescript
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24h

async function checkForUpdates(currentVersion: string): Promise<void> {
    try {
        const response = await fetch("https://example.com/version.json");
        const { latest } = await response.json();
        if (isNewerVersion(latest, currentVersion)) {
            streamDeck.logger.info(`Update available: ${latest}`);
            // Notify via global settings so PI can show banner
            await streamDeck.settings.setGlobalSettings({
                ...await streamDeck.settings.getGlobalSettings(),
                updateAvailable: latest,
            });
        }
    } catch {
        // Update check is non-critical; ignore errors
    }
}

function isNewerVersion(latest: string, current: string): boolean {
    const [lMaj, lMin, lPat] = latest.split(".").map(Number);
    const [cMaj, cMin, cPat] = current.split(".").map(Number);
    return lMaj > cMaj ||
        (lMaj === cMaj && lMin > cMin) ||
        (lMaj === cMaj && lMin === cMin && lPat > cPat);
}
```

## Rollback Procedures

### What to Do When a Release Breaks Things

1. **Keep one previous version** of your plugin package (`.streamDeckPlugin` file) accessible for manual rollback
2. **Document the rollback steps** in your internal runbook
3. **Test migrations can run forward AND backward** when possible
4. If a migration is irreversible, keep the old data under a different key before overwriting

```typescript
// Preserve original data before destructive migration
function migrateV1toV2Safely(s: any): any {
    return {
        ...s,
        host: s.server ?? "localhost",
        _legacyServer: s.server, // keep original for manual recovery
        schemaVersion: 2,
    };
}
```

### Recovery from Corrupt Settings

If settings are corrupted (e.g., `null` or wrong type), fall back to defaults:

```typescript
override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    let settings: Settings;
    try {
        settings = migrate(ev.payload.settings ?? {});
    } catch (err) {
        streamDeck.logger.error("Settings corrupt, resetting to defaults:", err);
        settings = { ...DEFAULT_SETTINGS };
    }
    await ev.action.setSettings(settings);
    await this.applySettings(ev.action, settings);
}
```

## Version History / Changelog

Maintain a `CHANGELOG.md` in your plugin repository using [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [2.0.0] - 2025-10-01
### Breaking Changes
- `server` setting renamed to `host` (automatic migration applied)
- `port` is now stored as a number instead of a string

### Added
- Support for Stream Deck Neo info panel
- Offline queue for failed API requests

### Fixed
- Actions sometimes showed stale titles after profile switch

## [1.3.2] - 2025-08-15
### Fixed
- Memory leak in WebSocket reconnect loop
```

## Testing Migrations

Write explicit tests for every migration function:

```typescript
// migrations.test.ts
describe("Settings migrations", () => {
    it("migrates v0 to v1: renames server to host", () => {
        const v0 = { server: "myserver", schemaVersion: 0 };
        const result = migrate(v0);
        expect(result.host).toBe("myserver");
        expect("server" in result).toBe(false);
        expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    });

    it("migrates v1 to v2: converts port string to number", () => {
        const v1 = { host: "localhost", port: "9000", schemaVersion: 1 };
        const result = migrate(v1);
        expect(result.port).toBe(9000);
        expect(typeof result.port).toBe("number");
    });

    it("does not re-migrate current version", () => {
        const current = { ...DEFAULT_SETTINGS };
        const spy = jest.spyOn(console, "warn");
        const result = migrate(current);
        expect(result).toEqual(current);
        expect(spy).not.toHaveBeenCalled();
    });

    it("handles completely empty settings (first install)", () => {
        const result = migrate({});
        expect(result.host).toBe("localhost");
        expect(result.port).toBe(8080);
        expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    });
});
```

## Best Practices

1. **Always include `schemaVersion`** in your settings types from day one
2. **Migrate lazily on first load**, not eagerly on plugin start (avoids touching settings for inactive actions)
3. **Never remove keys immediately** — deprecate for one MAJOR version first
4. **Write migration tests** before shipping — they catch edge cases early
5. **Keep defaults safe** — every new field should have a sensible default value
6. **Log migrations** so you can diagnose issues in the wild: `streamDeck.logger.info("Migrated settings from v1 to v2")`
7. **Avoid multi-step mutations** — apply all migrations in a single `setSettings()` call
8. **Document breaking changes** in your changelog before release

---

**Related Documentation**:
- [Settings Persistence](../core-concepts/settings-persistence.md)
- [Build and Deploy](../development-workflow/build-and-deploy.md)
- [Testing Strategies](../development-workflow/testing-strategies.md)
