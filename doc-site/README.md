# Stream Deck Plugin Development Documentation Site

This documentation website is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator optimized for technical documentation.

## 🚀 Quick Start

### Installation

```bash
npm install
# or
yarn install
```

### Local Development

```bash
npm start
# or
yarn start
```

This command starts a local development server at `http://localhost:3000` and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
# or
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Serve Production Build Locally

```bash
npm run serve
# or
yarn serve
```

Test the production build locally before deploying.

## 📁 Project Structure

```
doc-site/
├── docs/                    # Documentation markdown files
│   ├── getting-started/
│   ├── core-concepts/
│   ├── development-guide/
│   ├── ui-components/
│   ├── code-templates/
│   ├── security/
│   ├── advanced-topics/
│   ├── troubleshooting/
│   ├── api-reference/
│   ├── examples/
│   └── intro.md
├── src/
│   ├── components/          # React components
│   │   └── HomepageFeatures/
│   ├── css/                 # Custom CSS
│   └── pages/               # Custom pages (index.tsx)
├── static/                  # Static assets (images, etc.)
├── docusaurus.config.ts     # Site configuration
├── sidebars.ts              # Sidebar navigation
└── package.json
```

## 🛠️ Development

### Adding New Documentation

1. Create a new `.md` or `.mdx` file in the appropriate `docs/` subdirectory
2. Add frontmatter at the top:
   ```md
   ---
   sidebar_label: 'Your Page Title'
   sidebar_position: 1
   ---
   ```
3. The page will automatically appear in the sidebar based on `sidebars.ts`

### Updating the Sidebar

Edit `sidebars.ts` to customize the sidebar navigation structure.

### Customizing the Homepage

Edit `src/pages/index.tsx` and `src/components/HomepageFeatures/index.tsx` to customize the landing page.

### Adding Custom Styles

Add custom CSS to `src/css/custom.css`.

## 🚢 Deployment

### GitHub Pages (Recommended)

Using SSH:

```bash
USE_SSH=true npm run deploy
# or
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> npm run deploy
# or
GIT_USER=<Your GitHub username> yarn deploy
```

This command builds the website and pushes to the `gh-pages` branch.

### Manual Deployment

1. Build the site: `npm run build`
2. Deploy the `build/` directory to your hosting service

## 🔧 Configuration

### Site Metadata

Edit `docusaurus.config.ts` to update:
- Site title and tagline
- Base URL and organization name
- Theme configuration
- Plugin settings

### Markdown Features

Docusaurus supports:
- ✅ MDX (JSX in Markdown)
- ✅ Code blocks with syntax highlighting
- ✅ Admonitions (:::tip, :::warning, etc.)
- ✅ Tabs
- ✅ Mermaid diagrams
- ✅ Math equations (KaTeX)

## 📚 Resources

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Markdown Features](https://docusaurus.io/docs/markdown-features)
- [Deployment Guide](https://docusaurus.io/docs/deployment)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm start`
5. Build to verify: `npm run build`
6. Submit a pull request

## 📄 License

Documentation content is based on official Elgato Stream Deck SDK documentation.
