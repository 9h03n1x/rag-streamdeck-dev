# Security Requirements

## Credential Storage

### ❌ NEVER Store Secrets in Action Settings

```typescript
// ❌ BAD - Exported with profiles, visible in exports
await ev.action.setSettings({
    apiKey: "secret-key",
    password: "pass123"
});
```

### ✅ Use Global Settings

```typescript
// ✅ BETTER - Not exported with profiles
await streamDeck.settings.setGlobalSettings({
    apiKey: "secret-key"
});
```

### ✅ BEST - OAuth Flow

```typescript
override async onKeyDown(ev: KeyDownEvent) {
    // Open OAuth page
    await streamDeck.system.openUrl('https://auth.service.com/oauth');
    
    // Receive token via deep-link
    streamDeck.system.onDidReceiveDeepLink(async (ev) => {
        const token = extractTokenFromUrl(ev.payload.url);
        await streamDeck.settings.setGlobalSettings({ token });
    });
}
```

## Data Encryption

### Encrypt Sensitive Data

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

class Encryption {
    private algorithm = 'aes-256-cbc';
    private key: Buffer;
    
    constructor(password: string) {
        this.key = Buffer.from(password.padEnd(32).slice(0, 32));
    }
    
    encrypt(text: string): string {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    
    decrypt(text: string): string {
        const parts = text.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = createDecipheriv(this.algorithm, this.key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

// Usage
const encryption = new Encryption('user-password');
const encrypted = encryption.encrypt('sensitive-data');
await streamDeck.settings.setGlobalSettings({ data: encrypted });
```

## Input Validation

### Always Validate User Input

```typescript
function validateUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

override async onDidReceiveSettings(ev: DidReceiveSettingsEvent) {
    const { url, email } = ev.payload.settings;
    
    if (url && !validateUrl(url)) {
        streamDeck.logger.warn('Invalid URL provided');
        return;
    }
    
    if (email && !validateEmail(email)) {
        streamDeck.logger.warn('Invalid email provided');
        return;
    }
}
```

## Secure HTTP Requests

### Use HTTPS Only

```typescript
import axios from 'axios';

async function makeSecureRequest(url: string) {
    // Ensure HTTPS
    if (!url.startsWith('https://')) {
        throw new Error('Only HTTPS URLs allowed');
    }
    
    return await axios.get(url, {
        timeout: 10000,
        validateStatus: (status) => status < 500
    });
}
```

### Certificate Validation

```typescript
import https from 'https';
import axios from 'axios';

const httpsAgent = new https.Agent({
    rejectUnauthorized: true, // Enforce SSL validation
    minVersion: 'TLSv1.2'
});

axios.defaults.httpsAgent = httpsAgent;
```

## Path Traversal Prevention

```typescript
import path from 'path';

function validatePath(userPath: string, basePath: string): boolean {
    const resolvedPath = path.resolve(basePath, userPath);
    return resolvedPath.startsWith(path.resolve(basePath));
}

async function readFile(filename: string) {
    const basePath = '/safe/directory';
    
    if (!validatePath(filename, basePath)) {
        throw new Error('Invalid file path');
    }
    
    // Safe to read
}
```

## Rate Limiting

```typescript
class RateLimiter {
    private calls: Map<string, number[]> = new Map();
    private maxCalls: number;
    private windowMs: number;
    
    constructor(maxCalls: number, windowMs: number) {
        this.maxCalls = maxCalls;
        this.windowMs = windowMs;
    }
    
    async checkLimit(key: string): Promise<boolean> {
        const now = Date.now();
        const calls = this.calls.get(key) || [];
        
        // Remove old calls
        const recentCalls = calls.filter(time => now - time < this.windowMs);
        
        if (recentCalls.length >= this.maxCalls) {
            return false; // Rate limit exceeded
        }
        
        recentCalls.push(now);
        this.calls.set(key, recentCalls);
        return true;
    }
}

const limiter = new RateLimiter(10, 60000); // 10 calls per minute

override async onKeyDown(ev: KeyDownEvent) {
    if (!await limiter.checkLimit(ev.context)) {
        streamDeck.logger.warn('Rate limit exceeded');
        await ev.action.showAlert();
        return;
    }
    
    // Process action
}
```

## Secure Random Generation

```typescript
import { randomBytes } from 'crypto';

function generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
}

function generateApiKey(): string {
    return generateSecureToken(32);
}
```

## Content Security

### Sanitize HTML

```typescript
function sanitizeHtml(html: string): string {
    return html
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
```

### Sanitize URLs

```typescript
function sanitizeUrl(url: string): string {
    const parsed = new URL(url);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
    }
    
    return parsed.toString();
}
```

## Security Checklist

- [ ] No credentials in action settings
- [ ] Global settings for sensitive data
- [ ] OAuth for third-party authentication
- [ ] Input validation on all user data
- [ ] HTTPS only for external requests
- [ ] Certificate validation enabled
- [ ] Path traversal protection
- [ ] Rate limiting implemented
- [ ] Secure random generation
- [ ] HTML/URL sanitization
- [ ] Error messages don't leak sensitive info
- [ ] Logs don't contain credentials
- [ ] Dependencies regularly updated
- [ ] Security audit before release

## Best Practices

1. **Minimize Permissions**: Only request necessary permissions
2. **Encrypt Sensitive Data**: Always encrypt before storage
3. **Validate Everything**: Never trust user input
4. **Use HTTPS**: No HTTP for external requests
5. **Regular Updates**: Keep dependencies updated
6. **Security Reviews**: Regular code audits
7. **Error Handling**: Don't leak sensitive info in errors
8. **Logging**: Never log credentials or sensitive data
