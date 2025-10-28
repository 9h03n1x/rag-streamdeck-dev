# OAuth Implementation Guide

> **Status**: ✅ Complete

## Overview

Complete guide to implementing OAuth 2.0 authentication in Stream Deck plugins. This guide covers how to embed OAuth credentials in your plugin, manage user authorization, and securely store access tokens.

## Key Concepts

### Developer vs User Credentials

**Developer Credentials (Embedded in Plugin)**:
- Client ID
- Client Secret (if required by provider)
- These are hardcoded in your plugin code
- Created once by you in the service's developer portal
- Shared across all users of your plugin

**User Credentials (Stored per User)**:
- Access Token
- Refresh Token
- Token expiration time
- Stored securely in Global Settings
- Unique to each user

### Security Model

```
┌─────────────────────────────────────────┐
│  Plugin Code (Public)                   │
│  ✓ Client ID (embedded)                 │
│  ✓ Client Secret (embedded)*            │
│  ✓ Redirect URI                         │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Global Settings (Secure)               │
│  ✓ User's Access Token                  │
│  ✓ User's Refresh Token                 │
│  ✓ Token Expiration                     │
└─────────────────────────────────────────┘
```

*Note: Client secrets are technically visible in plugin code, but this is the accepted pattern for desktop OAuth applications. Use PKCE when available for enhanced security.

## OAuth Flow Overview

### Standard Authorization Code Flow

1. **User Initiates**: User clicks "Connect" in Property Inspector
2. **Browser Opens**: Plugin opens authorization URL in default browser
3. **User Authorizes**: User logs in and grants permissions
4. **Callback**: Service redirects to local callback server
5. **Exchange Code**: Plugin exchanges authorization code for tokens
6. **Store Tokens**: Plugin stores access/refresh tokens in Global Settings
7. **API Calls**: Plugin uses access token for authenticated requests

## Implementation Patterns

### Complete OAuth Implementation

Here's a complete example implementing OAuth 2.0 with token management:

```typescript
import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { open } from "open";
import http from "http";
import crypto from "crypto";

// OAuth Configuration (Developer Credentials - Embedded in Plugin)
const OAUTH_CONFIG = {
    clientId: "your-client-id-here",
    clientSecret: "your-client-secret-here", // Optional for some providers
    authorizationUrl: "https://provider.com/oauth/authorize",
    tokenUrl: "https://provider.com/oauth/token",
    redirectUri: "http://localhost:3000/callback",
    scope: "read write"
};

// Token storage key
const SETTINGS_KEY = "oauth_tokens";

/**
 * Initiates OAuth flow
 */
export async function startOAuthFlow(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // Generate PKCE code verifier and challenge (recommended)
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        
        // Generate state for CSRF protection
        const state = crypto.randomBytes(16).toString('hex');
        
        // Store for verification
        const pendingAuth = { codeVerifier, state };
        
        // Build authorization URL
        const authUrl = new URL(OAUTH_CONFIG.authorizationUrl);
        authUrl.searchParams.set('client_id', OAUTH_CONFIG.clientId);
        authUrl.searchParams.set('redirect_uri', OAUTH_CONFIG.redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', OAUTH_CONFIG.scope);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        
        // Start local callback server
        const server = createCallbackServer(async (code, returnedState) => {
            server.close();
            
            // Verify state matches (CSRF protection)
            if (returnedState !== state) {
                reject(new Error('State mismatch - possible CSRF attack'));
                return;
            }
            
            try {
                // Exchange authorization code for tokens
                const tokens = await exchangeCodeForTokens(code, codeVerifier);
                
                // Store tokens securely in Global Settings
                await saveTokens(tokens);
                
                streamDeck.logger.info('OAuth authentication successful');
                resolve(true);
            } catch (error) {
                streamDeck.logger.error('Token exchange failed:', error);
                reject(error);
            }
        });
        
        // Open authorization URL in default browser
        open(authUrl.toString());
    });
}

/**
 * Creates local HTTP server to receive OAuth callback
 */
function createCallbackServer(
    onCallback: (code: string, state: string) => void
): http.Server {
    const server = http.createServer((req, res) => {
        const url = new URL(req.url!, `http://localhost:3000`);
        
        if (url.pathname === '/callback') {
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');
            const error = url.searchParams.get('error');
            
            if (error) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body>
                            <h1>Authorization Failed</h1>
                            <p>Error: ${error}</p>
                            <p>You can close this window.</p>
                        </body>
                    </html>
                `);
                return;
            }
            
            if (code && state) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body>
                            <h1>Authorization Successful!</h1>
                            <p>You can close this window and return to Stream Deck.</p>
                            <script>window.close();</script>
                        </body>
                    </html>
                `);
                
                onCallback(code, state);
            }
        }
    });
    
    server.listen(3000);
    return server;
}

/**
 * Exchanges authorization code for access token
 */
async function exchangeCodeForTokens(
    code: string,
    codeVerifier: string
): Promise<OAuthTokens> {
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: OAUTH_CONFIG.redirectUri,
        client_id: OAUTH_CONFIG.clientId,
        code_verifier: codeVerifier
    });
    
    // Add client secret if required (not needed for PKCE-only flow)
    if (OAUTH_CONFIG.clientSecret) {
        params.set('client_secret', OAUTH_CONFIG.clientSecret);
    }
    
    const response = await fetch(OAUTH_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: params.toString()
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        tokenType: data.token_type || 'Bearer'
    };
}

/**
 * PKCE helper: Generate code verifier
 */
function generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
}

/**
 * PKCE helper: Generate code challenge from verifier
 */
function generateCodeChallenge(verifier: string): string {
    return crypto
        .createHash('sha256')
        .update(verifier)
        .digest('base64url');
}

interface OAuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    tokenType: string;
}
```

### Authorization Code Flow (Standard)

Use this when the OAuth provider supports client secrets:

```typescript
// Simpler flow without PKCE
const authUrl = new URL(OAUTH_CONFIG.authorizationUrl);
authUrl.searchParams.set('client_id', OAUTH_CONFIG.clientId);
authUrl.searchParams.set('redirect_uri', OAUTH_CONFIG.redirectUri);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', OAUTH_CONFIG.scope);

// Token exchange with client secret
const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    client_id: OAUTH_CONFIG.clientId,
    client_secret: OAUTH_CONFIG.clientSecret
});
```

### PKCE Flow (Recommended)

Use PKCE (Proof Key for Code Exchange) for enhanced security, especially when client secret cannot be kept secure:

```typescript
// Generate PKCE parameters
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto.createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

// Add to authorization URL
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');

// Exchange code with verifier instead of secret
const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    client_id: OAUTH_CONFIG.clientId,
    code_verifier: codeVerifier // Instead of client_secret
});
```

### Implicit Flow (Not Recommended)

⚠️ **Deprecated**: Implicit flow is no longer recommended due to security concerns. Use Authorization Code + PKCE instead.

## Token Management

### Storing Tokens Securely

Always store user tokens in **Global Settings**, never in Action Settings:

```typescript
import streamDeck from "@elgato/streamdeck";

interface StoredTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // Unix timestamp
    tokenType: string; // Usually "Bearer"
}

/**
 * Save tokens to Global Settings (secure storage)
 */
async function saveTokens(tokens: OAuthTokens): Promise<void> {
    const settings: StoredTokens = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        tokenType: tokens.tokenType
    };
    
    await streamDeck.settings.setGlobalSettings({
        [SETTINGS_KEY]: settings
    });
    
    streamDeck.logger.info('Tokens saved successfully');
}

/**
 * Retrieve tokens from Global Settings
 */
async function getTokens(): Promise<StoredTokens | null> {
    const globalSettings = await streamDeck.settings.getGlobalSettings();
    const tokens = globalSettings[SETTINGS_KEY] as StoredTokens | undefined;
    
    if (!tokens) {
        streamDeck.logger.debug('No tokens found');
        return null;
    }
    
    return tokens;
}

/**
 * Clear stored tokens (logout)
 */
async function clearTokens(): Promise<void> {
    await streamDeck.settings.setGlobalSettings({
        [SETTINGS_KEY]: null
    });
    
    streamDeck.logger.info('Tokens cleared');
}
```

### Token Refresh

Automatically refresh tokens before they expire:

```typescript
/**
 * Get valid access token, refreshing if necessary
 */
async function getValidAccessToken(): Promise<string | null> {
    const tokens = await getTokens();
    
    if (!tokens) {
        streamDeck.logger.debug('No tokens available');
        return null;
    }
    
    // Check if token is expired or will expire soon (5 minute buffer)
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    const isExpired = tokens.expiresAt - Date.now() < bufferTime;
    
    if (isExpired) {
        streamDeck.logger.info('Token expired, refreshing...');
        
        try {
            const newTokens = await refreshAccessToken(tokens.refreshToken);
            await saveTokens(newTokens);
            return newTokens.accessToken;
        } catch (error) {
            streamDeck.logger.error('Token refresh failed:', error);
            
            // Clear invalid tokens
            await clearTokens();
            return null;
        }
    }
    
    return tokens.accessToken;
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: OAUTH_CONFIG.clientId
    });
    
    // Add client secret if required
    if (OAUTH_CONFIG.clientSecret) {
        params.set('client_secret', OAUTH_CONFIG.clientSecret);
    }
    
    const response = await fetch(OAUTH_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: params.toString()
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Some providers don't return new refresh token
        expiresAt: Date.now() + (data.expires_in * 1000),
        tokenType: data.token_type || 'Bearer'
    };
}
```

### Token Expiration Handling

Gracefully handle expired tokens in API calls:

```typescript
/**
 * Make authenticated API request with automatic token refresh
 */
async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const accessToken = await getValidAccessToken();
    
    if (!accessToken) {
        throw new Error('Not authenticated - user needs to connect');
    }
    
    // Add authorization header
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Handle 401 Unauthorized (token invalid)
    if (response.status === 401) {
        streamDeck.logger.warn('Received 401, tokens may be invalid');
        
        // Try refreshing token once more
        const tokens = await getTokens();
        if (tokens?.refreshToken) {
            try {
                const newTokens = await refreshAccessToken(tokens.refreshToken);
                await saveTokens(newTokens);
                
                // Retry request with new token
                headers.set('Authorization', `Bearer ${newTokens.accessToken}`);
                return await fetch(url, { ...options, headers });
            } catch (error) {
                streamDeck.logger.error('Token refresh failed on 401:', error);
                await clearTokens();
                throw new Error('Authentication failed - user needs to reconnect');
            }
        }
    }
    
    return response;
}

/**
 * Example usage in action
 */
class MyApiAction extends Action {
    override async onKeyDown(ev: KeyDownEvent): Promise<void> {
        try {
            const response = await authenticatedFetch('https://api.example.com/user');
            const data = await response.json();
            
            streamDeck.logger.info('API call successful:', data);
        } catch (error) {
            if (error.message.includes('Not authenticated')) {
                // Show user they need to connect
                await ev.action.showAlert();
                await ev.action.setTitle('Connect\nAccount');
            } else {
                streamDeck.logger.error('API call failed:', error);
                await ev.action.showAlert();
            }
        }
    }
}
```

### Proactive Token Refresh

Set up automatic token refresh before expiration:

```typescript
/**
 * Start background token refresh timer
 */
function startTokenRefreshTimer(): void {
    // Check every 5 minutes
    setInterval(async () => {
        const tokens = await getTokens();
        
        if (!tokens) return;
        
        // Refresh if expires within 10 minutes
        const expiresIn = tokens.expiresAt - Date.now();
        const shouldRefresh = expiresIn < 10 * 60 * 1000;
        
        if (shouldRefresh) {
            try {
                streamDeck.logger.info('Proactively refreshing token');
                const newTokens = await refreshAccessToken(tokens.refreshToken);
                await saveTokens(newTokens);
            } catch (error) {
                streamDeck.logger.error('Proactive refresh failed:', error);
            }
        }
    }, 5 * 60 * 1000); // Every 5 minutes
}

// Start timer when plugin loads
streamDeck.onDidConnect(() => {
    startTokenRefreshTimer();
});
```

## Local Server for Callback

### Starting Local Server

The plugin needs to run a temporary local HTTP server to receive the OAuth callback:

```typescript
import http from 'http';
import { URL } from 'url';

interface CallbackResult {
    code?: string;
    state?: string;
    error?: string;
    errorDescription?: string;
}

/**
 * Start temporary HTTP server for OAuth callback
 */
function startCallbackServer(
    port: number = 3000,
    timeout: number = 300000 // 5 minutes
): Promise<CallbackResult> {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const url = new URL(req.url!, `http://localhost:${port}`);
            
            // Only handle callback path
            if (url.pathname !== '/callback') {
                res.writeHead(404);
                res.end('Not Found');
                return;
            }
            
            // Extract callback parameters
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');
            const error = url.searchParams.get('error');
            const errorDescription = url.searchParams.get('error_description');
            
            // Send success/error page to user
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            
            if (error) {
                res.end(getErrorPage(error, errorDescription));
                resolve({ error, errorDescription: errorDescription || undefined });
            } else if (code) {
                res.end(getSuccessPage());
                resolve({ code, state: state || undefined });
            } else {
                res.end(getErrorPage('invalid_request', 'Missing code parameter'));
                resolve({ error: 'invalid_request' });
            }
            
            // Close server after sending response
            setTimeout(() => server.close(), 100);
        });
        
        // Handle server errors
        server.on('error', (err) => {
            reject(err);
        });
        
        // Start listening
        server.listen(port, () => {
            streamDeck.logger.info(`Callback server listening on port ${port}`);
        });
        
        // Timeout if no callback received
        setTimeout(() => {
            server.close();
            reject(new Error('OAuth callback timeout - user did not complete authorization'));
        }, timeout);
    });
}

/**
 * Generate success page HTML
 */
function getSuccessPage(): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Authorization Successful</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: #1a1a1a;
                    color: #fff;
                }
                .container {
                    text-align: center;
                    padding: 40px;
                }
                .checkmark {
                    font-size: 64px;
                    color: #4caf50;
                }
                h1 {
                    margin: 20px 0;
                    font-size: 24px;
                }
                p {
                    color: #999;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="checkmark">✓</div>
                <h1>Authorization Successful!</h1>
                <p>You can close this window and return to Stream Deck.</p>
            </div>
            <script>
                // Auto-close after 2 seconds
                setTimeout(() => window.close(), 2000);
            </script>
        </body>
        </html>
    `;
}

/**
 * Generate error page HTML
 */
function getErrorPage(error: string, description?: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Authorization Failed</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: #1a1a1a;
                    color: #fff;
                }
                .container {
                    text-align: center;
                    padding: 40px;
                }
                .error-icon {
                    font-size: 64px;
                    color: #f44336;
                }
                h1 {
                    margin: 20px 0;
                    font-size: 24px;
                }
                p {
                    color: #999;
                    margin: 10px 0;
                }
                .error-details {
                    color: #666;
                    font-size: 14px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error-icon">✕</div>
                <h1>Authorization Failed</h1>
                <p>${description || error}</p>
                <p class="error-details">Error: ${error}</p>
                <p>You can close this window and try again.</p>
            </div>
        </body>
        </html>
    `;
}
```

### Handling Callback

Complete callback handling with state verification:

```typescript
/**
 * Complete OAuth flow with callback handling
 */
async function performOAuthFlow(): Promise<boolean> {
    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    
    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    // Build authorization URL
    const authUrl = new URL(OAUTH_CONFIG.authorizationUrl);
    authUrl.searchParams.set('client_id', OAUTH_CONFIG.clientId);
    authUrl.searchParams.set('redirect_uri', OAUTH_CONFIG.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', OAUTH_CONFIG.scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    
    try {
        // Start callback server (returns Promise)
        const callbackPromise = startCallbackServer(3000);
        
        // Open browser for user authorization
        await open(authUrl.toString());
        
        // Wait for callback
        const result = await callbackPromise;
        
        // Check for errors
        if (result.error) {
            streamDeck.logger.error('OAuth error:', result.error, result.errorDescription);
            return false;
        }
        
        // Verify state matches (CSRF protection)
        if (result.state !== state) {
            streamDeck.logger.error('State mismatch - possible CSRF attack');
            return false;
        }
        
        // Exchange code for tokens
        if (result.code) {
            const tokens = await exchangeCodeForTokens(result.code, codeVerifier);
            await saveTokens(tokens);
            
            streamDeck.logger.info('OAuth authentication successful');
            return true;
        }
        
        return false;
    } catch (error) {
        streamDeck.logger.error('OAuth flow failed:', error);
        return false;
    }
}
```

### Security Considerations

#### Port Selection

```typescript
/**
 * Find available port for callback server
 */
async function findAvailablePort(startPort: number = 3000): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = http.createServer();
        
        server.listen(startPort, () => {
            const port = (server.address() as any).port;
            server.close(() => resolve(port));
        });
        
        server.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                // Port in use, try next one
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
    });
}
```

#### State Parameter (CSRF Protection)

Always use state parameter to prevent CSRF attacks:

```typescript
// Generate cryptographically random state
const state = crypto.randomBytes(32).toString('hex');

// Store state temporarily (in memory is fine for short-lived flow)
let expectedState: string | null = state;

// Verify on callback
if (receivedState !== expectedState) {
    throw new Error('CSRF detected: state mismatch');
}

// Clear after use
expectedState = null;
```

#### Callback Timeout

Always implement timeouts to prevent server hanging:

```typescript
const CALLBACK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const timeoutId = setTimeout(() => {
    server.close();
    reject(new Error('Authorization timeout'));
}, CALLBACK_TIMEOUT);

// Clear timeout on success
clearTimeout(timeoutId);
```

#### Localhost Only

Ensure callback server only listens on localhost:

```typescript
// ✅ CORRECT: Bind to localhost only
server.listen(port, '127.0.0.1', () => {
    console.log('Server listening on localhost only');
});

// ❌ WRONG: Binds to all interfaces
server.listen(port, () => {
    console.log('Server listening on all interfaces - security risk!');
});
```

## Provider-Specific Examples

### Google OAuth

```typescript
// Google OAuth Configuration
const GOOGLE_OAUTH = {
    clientId: "YOUR_CLIENT_ID.apps.googleusercontent.com",
    clientSecret: "YOUR_CLIENT_SECRET", // From Google Cloud Console
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    redirectUri: "http://localhost:3000/callback",
    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
};

// Google returns user info in ID token
async function getGoogleUserInfo(accessToken: string) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return await response.json();
}
```

**Setup Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable required APIs (e.g., Google+ API)
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/callback` as authorized redirect URI
6. Copy Client ID and Client Secret into plugin

### Spotify OAuth

```typescript
// Spotify OAuth Configuration
const SPOTIFY_OAUTH = {
    clientId: "YOUR_SPOTIFY_CLIENT_ID",
    clientSecret: "YOUR_SPOTIFY_CLIENT_SECRET", // From Spotify Dashboard
    authorizationUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
    redirectUri: "http://localhost:3000/callback",
    scope: "user-read-playback-state user-modify-playback-state user-read-currently-playing"
};

// Example: Get current playback
async function getCurrentPlayback(accessToken: string) {
    const response = await authenticatedFetch(
        'https://api.spotify.com/v1/me/player',
        { method: 'GET' }
    );
    
    if (response.status === 204) {
        return null; // No active playback
    }
    
    return await response.json();
}

// Example: Pause playback
async function pausePlayback(accessToken: string) {
    await authenticatedFetch(
        'https://api.spotify.com/v1/me/player/pause',
        { method: 'PUT' }
    );
}
```

**Setup Steps**:
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create new app
3. Add `http://localhost:3000/callback` as redirect URI
4. Copy Client ID and Client Secret into plugin

### Twitch OAuth

```typescript
// Twitch OAuth Configuration
const TWITCH_OAUTH = {
    clientId: "YOUR_TWITCH_CLIENT_ID",
    clientSecret: "YOUR_TWITCH_CLIENT_SECRET", // From Twitch Dev Console
    authorizationUrl: "https://id.twitch.tv/oauth2/authorize",
    tokenUrl: "https://id.twitch.tv/oauth2/token",
    redirectUri: "http://localhost:3000/callback",
    scope: "user:read:email channel:read:subscriptions"
};

// Twitch requires Client-ID header in addition to Authorization
async function twitchAuthenticatedFetch(url: string, options: RequestInit = {}) {
    const accessToken = await getValidAccessToken();
    
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);
    headers.set('Client-Id', TWITCH_OAUTH.clientId);
    
    return await fetch(url, { ...options, headers });
}

// Example: Get user info
async function getTwitchUserInfo() {
    const response = await twitchAuthenticatedFetch(
        'https://api.twitch.tv/helix/users'
    );
    const data = await response.json();
    return data.data[0];
}
```

**Setup Steps**:
1. Go to [Twitch Developers Console](https://dev.twitch.tv/console)
2. Register new application
3. Add `http://localhost:3000/callback` as OAuth Redirect URL
4. Copy Client ID and Client Secret into plugin

### GitHub OAuth

```typescript
// GitHub OAuth Configuration
const GITHUB_OAUTH = {
    clientId: "YOUR_GITHUB_CLIENT_ID",
    clientSecret: "YOUR_GITHUB_CLIENT_SECRET", // From GitHub Settings
    authorizationUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    redirectUri: "http://localhost:3000/callback",
    scope: "repo user"
};

// GitHub token exchange returns URL-encoded data by default
async function exchangeGitHubCode(code: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
        client_id: GITHUB_OAUTH.clientId,
        client_secret: GITHUB_OAUTH.clientSecret,
        code: code,
        redirect_uri: GITHUB_OAUTH.redirectUri
    });
    
    const response = await fetch(GITHUB_OAUTH.tokenUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json', // Request JSON response
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });
    
    const data = await response.json();
    
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || '',
        expiresAt: Date.now() + (data.expires_in || 31536000) * 1000,
        tokenType: data.token_type
    };
}

// Example: Get authenticated user
async function getGitHubUser(accessToken: string) {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    return await response.json();
}
```

**Setup Steps**:
1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Register new OAuth application
3. Add `http://localhost:3000/callback` as Authorization callback URL
4. Copy Client ID and Client Secret into plugin

### Discord OAuth

```typescript
// Discord OAuth Configuration
const DISCORD_OAUTH = {
    clientId: "YOUR_DISCORD_CLIENT_ID",
    clientSecret: "YOUR_DISCORD_CLIENT_SECRET", // From Discord Dev Portal
    authorizationUrl: "https://discord.com/api/oauth2/authorize",
    tokenUrl: "https://discord.com/api/oauth2/token",
    redirectUri: "http://localhost:3000/callback",
    scope: "identify guilds"
};

// Example: Get current user
async function getDiscordUser(accessToken: string) {
    const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return await response.json();
}
```

**Setup Steps**:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to OAuth2 settings
4. Add `http://localhost:3000/callback` as redirect URI
5. Copy Client ID and Client Secret into plugin

## Error Handling

### Common OAuth Errors

```typescript
/**
 * Handle OAuth errors gracefully
 */
async function handleOAuthError(error: string, description?: string): Promise<void> {
    switch (error) {
        case 'access_denied':
            // User denied authorization
            streamDeck.logger.info('User denied authorization');
            await streamDeck.ui.current?.showAlert();
            await streamDeck.ui.current?.setTitle('Access\nDenied');
            break;
            
        case 'invalid_scope':
            // Requested scope is invalid
            streamDeck.logger.error('Invalid OAuth scope:', description);
            await streamDeck.ui.current?.showAlert();
            break;
            
        case 'invalid_client':
            // Client credentials are invalid
            streamDeck.logger.error('Invalid client credentials');
            await streamDeck.ui.current?.showAlert();
            await streamDeck.ui.current?.setTitle('Config\nError');
            break;
            
        case 'invalid_grant':
            // Authorization code or refresh token is invalid
            streamDeck.logger.warn('Invalid grant, clearing tokens');
            await clearTokens();
            await streamDeck.ui.current?.setTitle('Connect\nAccount');
            break;
            
        case 'server_error':
        case 'temporarily_unavailable':
            // OAuth provider is having issues
            streamDeck.logger.error('OAuth provider error:', description);
            await streamDeck.ui.current?.showAlert();
            await streamDeck.ui.current?.setTitle('Service\nUnavailable');
            break;
            
        default:
            streamDeck.logger.error('Unknown OAuth error:', error, description);
            await streamDeck.ui.current?.showAlert();
            break;
    }
}

/**
 * Wrap OAuth operations with error handling
 */
async function safeOAuthOperation<T>(
    operation: () => Promise<T>,
    operationName: string
): Promise<T | null> {
    try {
        return await operation();
    } catch (error) {
        if (error instanceof Error) {
            streamDeck.logger.error(`${operationName} failed:`, error.message);
            
            // Check for specific error types
            if (error.message.includes('ECONNREFUSED')) {
                streamDeck.logger.error('Network connection failed');
            } else if (error.message.includes('timeout')) {
                streamDeck.logger.error('Operation timed out');
            }
        }
        return null;
    }
}
```

### User Cancellation

Handle when user cancels the authorization:

```typescript
async function performOAuthWithCancellation(): Promise<boolean> {
    streamDeck.logger.info('Starting OAuth flow...');
    
    try {
        // Start callback server with timeout
        const callbackPromise = startCallbackServer(3000, 300000); // 5 min timeout
        
        // Open browser
        await open(buildAuthUrl());
        
        // Wait for callback
        const result = await callbackPromise;
        
        // Check if user denied access
        if (result.error === 'access_denied') {
            streamDeck.logger.info('User cancelled authorization');
            
            // Notify user (don't show as error, it's expected)
            await streamDeck.ui.current?.setTitle('Cancelled');
            
            // Reset to connect state after delay
            setTimeout(async () => {
                await streamDeck.ui.current?.setTitle('Connect');
            }, 2000);
            
            return false;
        }
        
        // Handle other errors
        if (result.error) {
            await handleOAuthError(result.error, result.errorDescription);
            return false;
        }
        
        // Success flow
        if (result.code) {
            const tokens = await exchangeCodeForTokens(result.code);
            await saveTokens(tokens);
            return true;
        }
        
        return false;
    } catch (error) {
        if (error instanceof Error && error.message.includes('timeout')) {
            streamDeck.logger.info('OAuth flow timed out - user did not complete authorization');
            await streamDeck.ui.current?.setTitle('Timeout');
            
            setTimeout(async () => {
                await streamDeck.ui.current?.setTitle('Connect');
            }, 2000);
        } else {
            streamDeck.logger.error('OAuth flow failed:', error);
            await streamDeck.ui.current?.showAlert();
        }
        
        return false;
    }
}
```

### Network Errors

Implement retry logic with exponential backoff:

```typescript
/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            
            // Don't retry on authentication errors
            if (error instanceof Error) {
                if (error.message.includes('401') || 
                    error.message.includes('invalid_grant') ||
                    error.message.includes('access_denied')) {
                    throw error;
                }
            }
            
            // Calculate delay with exponential backoff
            const delay = initialDelay * Math.pow(2, attempt);
            
            streamDeck.logger.warn(
                `Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms...`
            );
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError!;
}

/**
 * Token exchange with retry
 */
async function exchangeCodeForTokensWithRetry(
    code: string,
    codeVerifier: string
): Promise<OAuthTokens> {
    return await retryWithBackoff(async () => {
        return await exchangeCodeForTokens(code, codeVerifier);
    }, 3, 1000);
}

/**
 * API call with retry
 */
async function authenticatedFetchWithRetry(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    return await retryWithBackoff(async () => {
        const response = await authenticatedFetch(url, options);
        
        // Retry on 5xx errors
        if (response.status >= 500) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        return response;
    }, 3, 1000);
}
```

### Circuit Breaker for API Calls

Prevent overwhelming failing services:

```typescript
class CircuitBreaker {
    private failures: number = 0;
    private lastFailureTime: number = 0;
    private state: 'closed' | 'open' | 'half-open' = 'closed';
    
    constructor(
        private threshold: number = 5,
        private timeout: number = 60000 // 1 minute
    ) {}
    
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        // Check if circuit should transition from open to half-open
        if (this.state === 'open') {
            const timeSinceLastFailure = Date.now() - this.lastFailureTime;
            
            if (timeSinceLastFailure > this.timeout) {
                this.state = 'half-open';
                streamDeck.logger.info('Circuit breaker: half-open, trying request');
            } else {
                throw new Error('Circuit breaker is open - service unavailable');
            }
        }
        
        try {
            const result = await fn();
            
            // Success - reset circuit
            if (this.state === 'half-open') {
                this.state = 'closed';
                streamDeck.logger.info('Circuit breaker: closed, service recovered');
            }
            this.failures = 0;
            
            return result;
        } catch (error) {
            this.failures++;
            this.lastFailureTime = Date.now();
            
            streamDeck.logger.warn(`Circuit breaker: failure ${this.failures}/${this.threshold}`);
            
            // Open circuit if threshold exceeded
            if (this.failures >= this.threshold) {
                this.state = 'open';
                streamDeck.logger.error('Circuit breaker: OPEN - too many failures');
            }
            
            throw error;
        }
    }
    
    getState() {
        return this.state;
    }
    
    reset() {
        this.state = 'closed';
        this.failures = 0;
        this.lastFailureTime = 0;
    }
}

// Usage
const apiCircuitBreaker = new CircuitBreaker(5, 60000);

async function callApiWithCircuitBreaker(url: string) {
    try {
        return await apiCircuitBreaker.execute(() => authenticatedFetch(url));
    } catch (error) {
        if (error.message.includes('Circuit breaker is open')) {
            // Show user-friendly message
            await streamDeck.ui.current?.setTitle('Service\nDown');
            await streamDeck.ui.current?.showAlert();
        }
        throw error;
    }
}
```

## Multi-Account Support

Allow users to connect multiple accounts (e.g., personal and work):

```typescript
interface AccountInfo {
    id: string;
    name: string;
    tokens: OAuthTokens;
}

/**
 * Store multiple accounts
 */
async function saveAccount(account: AccountInfo): Promise<void> {
    const settings = await streamDeck.settings.getGlobalSettings();
    const accounts = (settings.accounts as AccountInfo[]) || [];
    
    // Update existing or add new
    const index = accounts.findIndex(a => a.id === account.id);
    if (index >= 0) {
        accounts[index] = account;
    } else {
        accounts.push(account);
    }
    
    await streamDeck.settings.setGlobalSettings({ accounts });
}

/**
 * Get all connected accounts
 */
async function getAccounts(): Promise<AccountInfo[]> {
    const settings = await streamDeck.settings.getGlobalSettings();
    return (settings.accounts as AccountInfo[]) || [];
}

/**
 * Get specific account tokens
 */
async function getAccountTokens(accountId: string): Promise<OAuthTokens | null> {
    const accounts = await getAccounts();
    const account = accounts.find(a => a.id === accountId);
    return account?.tokens || null;
}

/**
 * Property Inspector: Account selector
 */
// In PI HTML
// <sdpi-select setting="accountId" label="Account">
//     <option value="">Select account...</option>
//     <!-- Populated dynamically -->
// </sdpi-select>

// In plugin code
streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
    const accounts = ev.payload.settings.accounts as AccountInfo[];
    
    // Send accounts to Property Inspector
    streamDeck.ui.current?.sendToPropertyInspector({
        event: 'accountsUpdated',
        accounts: accounts.map(a => ({ id: a.id, name: a.name }))
    });
});
```

## Testing OAuth Flow

### Manual Testing

```typescript
// Add test mode that uses mock tokens
const TEST_MODE = process.env.NODE_ENV === 'development';

async function getValidAccessToken(): Promise<string | null> {
    if (TEST_MODE) {
        return 'test-token-123';
    }
    
    // Normal OAuth flow
    return await getRealAccessToken();
}

// Mock API responses in test mode
async function authenticatedFetch(url: string, options: RequestInit = {}) {
    if (TEST_MODE) {
        return mockApiResponse(url);
    }
    
    return await realAuthenticatedFetch(url, options);
}
```

### Unit Testing

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('OAuth Token Management', () => {
    it('should refresh token before expiration', async () => {
        // Mock tokens expiring in 1 minute
        const tokens = {
            accessToken: 'old-token',
            refreshToken: 'refresh-token',
            expiresAt: Date.now() + 60000,
            tokenType: 'Bearer'
        };
        
        // Mock storage
        vi.spyOn(streamDeck.settings, 'getGlobalSettings')
            .mockResolvedValue({ tokens });
        
        // Mock refresh
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({
                access_token: 'new-token',
                refresh_token: 'new-refresh',
                expires_in: 3600
            })
        } as Response);
        
        const token = await getValidAccessToken();
        
        expect(token).toBe('new-token');
    });
    
    it('should handle token refresh failure', async () => {
        const tokens = {
            accessToken: 'old-token',
            refreshToken: 'invalid-refresh',
            expiresAt: Date.now() - 1000, // Expired
            tokenType: 'Bearer'
        };
        
        vi.spyOn(streamDeck.settings, 'getGlobalSettings')
            .mockResolvedValue({ tokens });
        
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            status: 400
        } as Response);
        
        const token = await getValidAccessToken();
        
        expect(token).toBeNull();
    });
});
```

## Security Best Practices

### ✅ DO

1. **Store tokens in Global Settings**
   ```typescript
   await streamDeck.settings.setGlobalSettings({ tokens });
   ```

2. **Use PKCE when possible**
   ```typescript
   const codeVerifier = generateCodeVerifier();
   const codeChallenge = generateCodeChallenge(codeVerifier);
   ```

3. **Validate state parameter**
   ```typescript
   if (receivedState !== expectedState) {
       throw new Error('CSRF attack detected');
   }
   ```

4. **Use HTTPS for all API calls**
   ```typescript
   const response = await fetch('https://api.example.com/...');
   ```

5. **Implement token refresh**
   ```typescript
   if (isTokenExpiringSoon()) {
       await refreshAccessToken();
   }
   ```

6. **Handle token expiration gracefully**
   ```typescript
   if (response.status === 401) {
       await refreshAndRetry();
   }
   ```

7. **Clear tokens on logout**
   ```typescript
   await streamDeck.settings.setGlobalSettings({ tokens: null });
   ```

8. **Bind callback server to localhost only**
   ```typescript
   server.listen(port, '127.0.0.1');
   ```

### ❌ DON'T

1. **Don't store tokens in Action Settings**
   ```typescript
   // ❌ WRONG: Action settings are less secure
   await action.setSettings({ accessToken: token });
   ```

2. **Don't log sensitive data**
   ```typescript
   // ❌ WRONG: Exposes token in logs
   console.log('Token:', accessToken);
   
   // ✅ CORRECT: Log without sensitive data
   console.log('Token length:', accessToken.length);
   ```

3. **Don't skip state validation**
   ```typescript
   // ❌ WRONG: Vulnerable to CSRF
   const code = urlParams.get('code');
   await exchangeCode(code);
   ```

4. **Don't use implicit flow**
   ```typescript
   // ❌ WRONG: Deprecated and insecure
   response_type: 'token'
   
   // ✅ CORRECT: Use authorization code + PKCE
   response_type: 'code'
   ```

5. **Don't hardcode redirect ports**
   ```typescript
   // ❌ WRONG: Port might be in use
   server.listen(3000);
   
   // ✅ CORRECT: Find available port
   const port = await findAvailablePort();
   ```

## Troubleshooting

### Common Issues

**Problem**: "Port 3000 already in use"
```typescript
// Solution: Use dynamic port finding
const port = await findAvailablePort(3000);
```

**Problem**: Tokens expire immediately after refresh
```typescript
// Solution: Check clock sync and timezone
const expiresAt = Date.now() + (expires_in * 1000);
console.log('Token expires:', new Date(expiresAt).toISOString());
```

**Problem**: Browser doesn't open
```typescript
// Solution: Check if 'open' package is installed
// npm install open
import { open } from 'open';
await open(authUrl);
```

**Problem**: Callback page doesn't load
```typescript
// Solution: Verify redirect URI matches exactly
console.log('Configured:', OAUTH_CONFIG.redirectUri);
console.log('Provider expects:', providerRedirectUri);
```

**Problem**: State mismatch error
```typescript
// Solution: Ensure state is stored and validated correctly
const state = crypto.randomBytes(16).toString('hex');
// Store in closure or temporary storage
// Validate on callback
```

**Problem**: Invalid client error
```typescript
// Solution: Verify client credentials
console.log('Client ID:', OAUTH_CONFIG.clientId);
// Double-check credentials in provider dashboard
```

### Debug Logging

```typescript
// Enable detailed OAuth logging
streamDeck.logger.setLevel(LogLevel.DEBUG);

// Log OAuth flow steps
streamDeck.logger.debug('Starting OAuth flow');
streamDeck.logger.debug('Auth URL:', authUrl);
streamDeck.logger.debug('Callback received:', { code: code?.substring(0, 10) });
streamDeck.logger.debug('Token exchange successful');
streamDeck.logger.debug('Tokens saved to Global Settings');
```

---

**Related Documentation**:
- [Security Requirements](../security/security-requirements)
- [Settings Persistence](../core-concepts/settings-persistence)
