---
category: advanced-topics
title: OAuth Provider Setup Reference
tags: [oauth, google, spotify, twitch, github, discord, setup]
difficulty: intermediate
sdk-version: v2
source-of-truth: Local KB (Stream Deck callback patterns); Official provider docs
review-cadence: On provider API changes
status: External-source summary
---

# OAuth Provider Setup Reference

This document provides provider-specific setup steps and code examples. For detailed provider configuration, account requirements, and policy changes, always consult the official provider documentation.

> **Note**: This page supplements [oauth-implementation.md](oauth-implementation.md), which covers core Stream Deck OAuth patterns, token storage, and refresh flows. Use that article first to understand the architecture.

## Google OAuth

**Official docs**: [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

```typescript
const GOOGLE_OAUTH = {
    clientId: "YOUR_CLIENT_ID.apps.googleusercontent.com",
    clientSecret: "YOUR_CLIENT_SECRET",
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    redirectUri: "http://localhost:3000/callback",
    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
};

async function getGoogleUserInfo(accessToken: string) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return await response.json();
}
```

**Setup**:
1. [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials (Desktop application)
4. Add `http://localhost:3000/callback` as authorized redirect URI
5. Copy Client ID and Secret

## Spotify OAuth

**Official docs**: [Spotify Developer Documentation](https://developer.spotify.com/documentation/general/guides/authorization/)

```typescript
const SPOTIFY_OAUTH = {
    clientId: "YOUR_SPOTIFY_CLIENT_ID",
    clientSecret: "YOUR_SPOTIFY_CLIENT_SECRET",
    authorizationUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
    redirectUri: "http://localhost:3000/callback",
    scope: "user-read-playback-state user-modify-playback-state"
};

async function getCurrentPlayback(accessToken: string) {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.status === 204 ? null : await response.json();
}
```

**Setup**:
1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create app
3. Add `http://localhost:3000/callback` as redirect URI
4. Copy Client ID and Secret

## Twitch OAuth

**Official docs**: [Twitch OAuth Documentation](https://dev.twitch.tv/docs/authentication/oauth-2)

```typescript
const TWITCH_OAUTH = {
    clientId: "YOUR_TWITCH_CLIENT_ID",
    clientSecret: "YOUR_TWITCH_CLIENT_SECRET",
    authorizationUrl: "https://id.twitch.tv/oauth2/authorize",
    tokenUrl: "https://id.twitch.tv/oauth2/token",
    redirectUri: "http://localhost:3000/callback",
    scope: "user:read:email channel:read:subscriptions"
};

// Twitch requires Client-ID header
async function twitchAuthenticatedFetch(url: string, options: RequestInit = {}) {
    const accessToken = await getValidAccessToken();
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);
    headers.set('Client-Id', TWITCH_OAUTH.clientId);
    return await fetch(url, { ...options, headers });
}

async function getTwitchUserInfo() {
    const response = await twitchAuthenticatedFetch('https://api.twitch.tv/helix/users');
    const data = await response.json();
    return data.data[0];
}
```

**Setup**:
1. [Twitch Developers Console](https://dev.twitch.tv/console)
2. Create application
3. Add `http://localhost:3000/callback` as OAuth Redirect URL
4. Copy Client ID and Secret

## GitHub OAuth

**Official docs**: [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)

```typescript
const GITHUB_OAUTH = {
    clientId: "YOUR_GITHUB_CLIENT_ID",
    clientSecret: "YOUR_GITHUB_CLIENT_SECRET",
    authorizationUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    redirectUri: "http://localhost:3000/callback",
    scope: "repo user"
};

// GitHub returns URL-encoded; request JSON explicitly
async function exchangeGitHubCode(code: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
        client_id: GITHUB_OAUTH.clientId,
        client_secret: GITHUB_OAUTH.clientSecret,
        code: code,
        redirect_uri: GITHUB_OAUTH.redirectUri
    });
    
    const response = await fetch(GITHUB_OAUTH.tokenUrl, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
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

**Setup**:
1. [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Create new OAuth application
3. Add `http://localhost:3000/callback` as Authorization callback URL
4. Copy Client ID and Secret

## Discord OAuth

**Official docs**: [Discord OAuth Documentation](https://discord.com/developers/docs/topics/oauth2)

```typescript
const DISCORD_OAUTH = {
    clientId: "YOUR_DISCORD_CLIENT_ID",
    clientSecret: "YOUR_DISCORD_CLIENT_SECRET",
    authorizationUrl: "https://discord.com/api/oauth2/authorize",
    tokenUrl: "https://discord.com/api/oauth2/token",
    redirectUri: "http://localhost:3000/callback",
    scope: "identify guilds"
};

async function getDiscordUser(accessToken: string) {
    const response = await fetch('https://discord.com/api/users/@me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return await response.json();
}
```

**Setup**:
1. [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to OAuth2 settings
4. Add `http://localhost:3000/callback` as redirect URI
5. Copy Client ID and Secret

## General Provider Checklist

When integrating a new OAuth provider:

- [ ] Read official OAuth 2.0 documentation
- [ ] Create developer account
- [ ] Register application with provider
- [ ] Add `http://localhost:3000/callback` as redirect URI
- [ ] Copy Client ID and Client Secret
- [ ] Determine if provider supports PKCE
- [ ] Check if custom headers required (e.g., Twitch `Client-Id`)
- [ ] Verify token endpoint response format (JSON vs URL-encoded)
- [ ] Test authorization flow locally
- [ ] Implement token refresh if provider supports it
- [ ] Document custom headers or quirks in plugin code
