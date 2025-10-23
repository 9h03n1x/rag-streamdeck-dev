# Managing Secrets in Stream Deck Plugins

## The Problem with .env Files

When developing Stream Deck plugins that require API credentials (OAuth client IDs/secrets, API keys, etc.), developers often use `.env` files during development. However, **`.env` files cannot be deployed with your plugin** because:

1. **Not Packaged**: The `.env` file is in your workspace root, not in the `.sdPlugin` folder that gets packaged
2. **Security Risk**: Secrets should never be committed to version control
3. **User-Specific**: Each installation would need its own `.env` file, which is not practical for end users

## Solution: Hardcode Shared Credentials

For **public OAuth applications** where all users share the same client credentials (standard for most OAuth integrations), the solution is to **hardcode the credentials directly in your source code**:

### Example: OAuth Credentials

```typescript
export class AuthService {
  // Hardcoded OAuth credentials for deployed plugin
  // These are registered with the OAuth provider specifically for this app
  private readonly clientId = "your-client-id-here";
  private readonly clientSecret = "your-client-secret-here";
  
  private readonly redirectUri = "http://localhost:8888/callback";
  private readonly authUrl = "https://oauth.provider.com/authorize";
  private readonly tokenUrl = "https://oauth.provider.com/token";
}
```

### Why This Is Safe

- **OAuth Security Model**: The client secret is used for server-to-server token exchange, but the actual user authorization still requires the user to log in and approve access
- **Standard Practice**: This is how most desktop OAuth apps work (Spotify, Discord, etc.)
- **No User Data Exposure**: The credentials only allow your app to request authorization; they don't grant access to any user data without user consent

## Development vs Production Workflow

### During Development

Use `.env` for easy testing:

```typescript
// Development: Read from environment
private get clientId(): string {
  return process.env.CLIENT_ID || "";
}
```

### Before Deployment

1. **Remove .env loading code** completely:
```typescript
// ❌ Remove this
import dotenv from 'dotenv';
dotenv.config();

// ❌ Remove this
const envFile = readFileSync('.env', 'utf-8');
```

2. **Hardcode credentials** in the actual service:
```typescript
// ✅ Do this
private readonly clientId = "abc123xyz";
private readonly clientSecret = "secret456def";
```

3. **Update .gitignore** to prevent accidental commits:
```gitignore
# Environment files (contains secrets - DO NOT COMMIT)
.env
.env.local
.env.*.local
```

## Alternative: User-Provided Credentials

If you want **each user to provide their own API credentials** (less common), you need to:

1. **Add Property Inspector UI** to collect credentials:
```json
{
  "PropertyInspectorPath": "ui/settings.html"
}
```

2. **Store securely** using Stream Deck's settings:
```typescript
import { streamDeck } from "@elgato/streamdeck";

// Store
await streamDeck.settings.setGlobalSettings({
  clientId: userProvidedId,
  clientSecret: userProvidedSecret
});

// Retrieve
const settings = await streamDeck.settings.getGlobalSettings();
```

3. **Use keytar** for extra sensitive data:
```typescript
import keytar from 'keytar';

await keytar.setPassword('MyPlugin', 'api-key', userApiKey);
const apiKey = await keytar.getPassword('MyPlugin', 'api-key');
```

## Common Pitfalls

### ❌ DON'T: Try to package .env files
```javascript
// This won't work - .env is not in the .sdPlugin folder
fs.readFileSync('.env')
```

### ❌ DON'T: Load from process.env in production
```typescript
// This won't work - deployed plugins don't have .env files
const secret = process.env.API_SECRET;
```

### ❌ DON'T: Commit secrets to Git
```bash
# Never do this!
git add .env
git commit -m "Add config"
```

### ✅ DO: Hardcode shared credentials
```typescript
private readonly apiKey = "pk_live_abc123xyz";
```

### ✅ DO: Use .gitignore
```gitignore
.env
.env.local
```

### ✅ DO: Document in README
```markdown
## Development Setup
1. Copy `.env.example` to `.env`
2. Fill in your OAuth credentials
```

## Build Process Best Practices

1. **Remove dotenv dependency** before deployment:
```json
{
  "dependencies": {
    "@elgato/streamdeck": "^1.0.0"
    // ❌ Remove: "dotenv": "^16.0.0"
  }
}
```

2. **Clean build scripts**:
```json
{
  "scripts": {
    "build": "rollup -c && npm run postbuild",
    "postbuild": "cd *.sdPlugin && npm install --omit=dev"
  }
}
```

3. **Verify deployment build**:
- Check that plugin.js doesn't reference `.env`
- Confirm credentials are hardcoded in bundle
- Test without `.env` file present

## Summary

**For most Stream Deck plugins with OAuth/API integrations:**

1. ✅ Use `.env` during **development only**
2. ✅ **Hardcode** shared credentials before deployment
3. ✅ **Remove** all `.env` loading code from production
4. ✅ Add `.env` to `.gitignore`
5. ✅ Document development setup in README

**This approach is:**
- ✅ Secure (follows OAuth security model)
- ✅ Simple (no configuration needed by users)  
- ✅ Standard (used by major desktop apps)
- ✅ Reliable (works in deployed environment)
