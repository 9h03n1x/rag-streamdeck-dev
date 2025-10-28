# Deployment Guide

This guide covers deploying your Docusaurus documentation site to various hosting platforms.

## GitHub Pages (Recommended)

### Prerequisites
- GitHub repository set up
- GitHub Actions enabled

### Automatic Deployment with GitHub Actions

1. **Create the workflow file**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Docusaurus

on:
  push:
    branches:
      - main

permissions:
  contents: write

jobs:
  deploy:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: doc-site/package-lock.json
      
      - name: Install dependencies
        run: |
          cd doc-site
          npm ci
      
      - name: Build website
        run: |
          cd doc-site
          npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./doc-site/build
          user_name: github-actions[bot]
          user_email: 41898282+github-actions[bot]@users.noreply.github.com
```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

3. **Push to trigger deployment**
```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push
```

Your site will be available at: `https://9h03n1x.github.io/rag-streamdeck-dev/`

### Manual Deployment

```bash
cd doc-site
npm run build

# Install gh-pages if not already installed
npm install -g gh-pages

# Deploy
npx gh-pages -d build
```

## Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd doc-site
vercel
```

3. **Configure `vercel.json`** (in `doc-site/` directory):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "docusaurus",
  "installCommand": "npm install"
}
```

## Netlify

### Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
cd doc-site
npm run build

# Deploy
netlify deploy --prod --dir=build
```

### Via Netlify UI

1. Connect your GitHub repository
2. Configure build settings:
   - **Base directory**: `doc-site`
   - **Build command**: `npm run build`
   - **Publish directory**: `doc-site/build`
3. Deploy

### `netlify.toml` Configuration

Create in project root:

```toml
[build]
  base = "doc-site"
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Cloudflare Pages

1. **Connect repository** in Cloudflare Pages dashboard
2. **Configure build**:
   - Build command: `cd doc-site && npm install && npm run build`
   - Build output directory: `doc-site/build`
   - Root directory: `/`
3. Deploy

## Self-Hosted (Docker)

Create `Dockerfile` in `doc-site/`:

```dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf` in `doc-site/`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:

```bash
cd doc-site
docker build -t streamdeck-docs .
docker run -p 8080:80 streamdeck-docs
```

## Environment Variables for Production

If you need to use environment variables in production:

1. **For Vercel/Netlify**: Add in their dashboard UI
2. **For GitHub Actions**: Add as repository secrets
3. **For Docker**: Use `--env-file` flag:

```bash
docker run --env-file .env -p 8080:80 streamdeck-docs
```

## Custom Domain

### GitHub Pages

1. Add `CNAME` file in `doc-site/static/`:
```
docs.yourdomain.com
```

2. Configure DNS:
   - Add CNAME record pointing to `9h03n1x.github.io`
   - Or A records to GitHub Pages IPs

### Vercel/Netlify/Cloudflare

Configure in their respective dashboards.

## Performance Optimization

### Enable Search

Add Algolia DocSearch:

```bash
cd doc-site
npm install --save @docusaurus/theme-search-algolia
```

Update `docusaurus.config.ts`:

```typescript
themeConfig: {
  algolia: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_SEARCH_API_KEY',
    indexName: 'YOUR_INDEX_NAME',
  },
}
```

### Enable Compression

Add to `docusaurus.config.ts`:

```typescript
plugins: [
  [
    '@docusaurus/plugin-client-redirects',
    {
      redirects: [],
    },
  ],
],
```

## Monitoring

### Google Analytics

Add to `docusaurus.config.ts`:

```typescript
themeConfig: {
  gtag: {
    trackingID: 'G-XXXXXXXXXX',
    anonymizeIP: true,
  },
}
```

### Plausible Analytics

```typescript
scripts: [
  {
    src: 'https://plausible.io/js/script.js',
    defer: true,
    'data-domain': 'your-domain.com',
  },
],
```

## Troubleshooting

### Build fails in CI/CD

Check Node.js version matches:
```json
"engines": {
  "node": ">=20.0.0"
}
```

### Assets not loading

Verify `baseUrl` in `docusaurus.config.ts` matches your deployment path.

### Search not working

Rebuild search index after deployment.

---

Choose the platform that best fits your needs. GitHub Pages is recommended for open-source projects, while Vercel/Netlify offer better performance for production sites.
