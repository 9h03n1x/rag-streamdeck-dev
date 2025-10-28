# Build and Deploy

## Build Process

### Development Build

```bash
# Single build
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# With auto-restart
npm run dev
```

The build process:
1. Compiles TypeScript to JavaScript
2. Bundles dependencies
3. Outputs to `*.sdPlugin/bin/`
4. Copies assets if configured

### Build Configuration

#### Rollup Configuration

`rollup.config.mjs`:
```javascript
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/plugin.ts',
  output: {
    file: 'com.company.plugin.sdPlugin/bin/plugin.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'auto'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true
    }),
    resolve({
      preferBuiltins: true
    }),
    copy({
      targets: [
        { src: 'assets/**/*', dest: 'com.company.plugin.sdPlugin/imgs' }
      ]
    })
  ],
  external: ['path', 'fs', 'os']
};
```

#### TypeScript Configuration

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

## Plugin Linking

### Link Plugin

```bash
# Link for development (symlink)
streamdeck link com.company.plugin.sdPlugin

# Or via npm script
npm run link
```

This creates a symlink from Stream Deck's plugin directory to your development directory.

### Unlink Plugin

```bash
streamdeck unlink com.company.plugin.sdPlugin
```

### Plugin Locations

**Windows**:
```
%AppData%\Elgato\StreamDeck\Plugins\
```

**macOS**:
```
~/Library/Application Support/com.elgato.StreamDeck/Plugins/
```

## Validation

### Validate Plugin

```bash
# Validate before packaging
streamdeck validate com.company.plugin.sdPlugin
```

Checks:
- Manifest schema
- Required files present
- UUID format
- Icon requirements
- Layout definitions
- File structure

### Common Validation Errors

**Missing manifest**:
```
Error: manifest.json not found
Solution: Ensure manifest.json exists in .sdPlugin root
```

**Invalid UUID**:
```
Error: UUID must be reverse-DNS format
Solution: Use format: com.company.plugin
```

**Missing CodePath**:
```
Error: CodePath file not found
Solution: Verify bin/plugin.js exists
```

## Packaging

### Create Distribution Package

```bash
# Pack plugin into .streamDeckPlugin file
streamdeck pack com.company.plugin.sdPlugin

# Or via npm script
npm run pack
```

Output: `com.company.plugin.streamDeckPlugin`

This creates an installable plugin file that users can double-click to install.

### Package Contents

The .streamDeckPlugin file contains:
- Compiled plugin code
- Manifest
- Images and assets
- Property inspector files
- NOT included: Source code, node_modules

### Pre-Pack Checklist

- [ ] Update version in manifest.json
- [ ] Run `npm run build`
- [ ] Run `streamdeck validate`
- [ ] Test all actions
- [ ] Test on both Windows and macOS
- [ ] Check all icons display correctly
- [ ] Verify property inspectors work
- [ ] Test with multiple devices
- [ ] Review changelog

## Distribution

### Local Installation

Users can install by:
1. Double-clicking .streamDeckPlugin file
2. Dragging to Stream Deck window
3. Using File > Install Plugin

### Marketplace Submission

1. **Prepare Assets**:
   - Plugin icon (72x72, 144x144, 512x512)
   - Screenshots
   - Description
   - Category

2. **Submit to Maker Console**:
   - Visit console.elgato.com
   - Create product listing
   - Upload .streamDeckPlugin
   - Add metadata
   - Submit for review

3. **Review Process**:
   - Elgato reviews submission
   - Feedback provided if issues
   - Approval typically 5-10 business days

### Version Updates

Update version in manifest.json:
```json
{
  "Version": "1.0.1.0"
}
```

Version format: `MAJOR.MINOR.PATCH.BUILD`

## Continuous Integration

### GitHub Actions

`.github/workflows/build.yml`:
```yaml
name: Build Plugin

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Validate
        run: |
          npm install -g @elgato/cli
          streamdeck validate com.company.plugin.sdPlugin
          
      - name: Pack
        run: streamdeck pack com.company.plugin.sdPlugin
        
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: plugin
          path: '*.streamDeckPlugin'
```

### Automated Releases

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - run: npm ci
      - run: npm run build
      - run: streamdeck pack com.company.plugin.sdPlugin
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: '*.streamDeckPlugin'
```

## Build Optimization

### Production Build

```javascript
// rollup.config.mjs
export default {
  // ... other config
  output: {
    file: 'com.company.plugin.sdPlugin/bin/plugin.js',
    format: 'cjs',
    sourcemap: false,  // Disable sourcemaps for production
    compact: true       // Minify output
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: false  // No sourcemaps
    }),
    terser()            // Minify
  ]
};
```

### Asset Optimization

```bash
# Optimize images
npm install -D imagemin imagemin-pngquant

# In build script
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';

await imagemin(['imgs/**/*.png'], {
  destination: 'com.company.plugin.sdPlugin/imgs',
  plugins: [
    imageminPngquant({ quality: [0.6, 0.8] })
  ]
});
```

## Debugging Build Issues

### Check Build Output

```bash
# Verbose build
rollup -c --verbose

# Check output file
ls -la com.company.plugin.sdPlugin/bin/

# Test plugin loads
node com.company.plugin.sdPlugin/bin/plugin.js
```

### Common Build Errors

**Cannot find module**:
```
Solution: Check import paths and tsconfig.json paths
```

**Decorator errors**:
```
Solution: Enable experimentalDecorators in tsconfig.json
```

**Bundle too large**:
```
Solution: Use external dependencies, tree shaking
```

## Best Practices

1. **Version Control**: Commit compiled plugin for releases
2. **Semantic Versioning**: Follow semver for versions
3. **Automated Testing**: Run tests before packaging
4. **Cross-Platform**: Test on Windows and macOS
5. **Clean Build**: `rm -rf bin && npm run build`
6. **Validate Always**: Run validation before packing
7. **Changelog**: Maintain CHANGELOG.md
8. **Dependencies**: Keep dependencies updated
