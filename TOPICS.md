# Documentation Topics Index

## Core Architecture
- Plugin runtime environment (Node.js + Chromium)
- WebSocket communication protocol
- Single instance plugin pattern
- Action lifecycle and events
- Property inspector architecture

## Action Development
- SingletonAction class
- Event handlers (onKeyDown, onDialRotate, etc.)
- Action registration
- Multi-state actions
- Dial/encoder support
- Visual feedback (title, image, alerts)

## Settings Management
- Action settings (per-instance)
- Global settings (plugin-wide)
- Settings persistence
- Type-safe settings
- Property inspector sync

## User Interface
- Property inspector basics
- sdpi-components library
- Form components (textfield, select, checkbox, etc.)
- Dynamic content loading
- Validation
- Authentication flows

## Communication
- Plugin to Stream Deck
- Property inspector to plugin
- Deep-link messages
- sendToPlugin / sendToPropertyInspector
- WebSocket events and commands

## Development Tools
- Stream Deck CLI commands
- VS Code debugger setup
- Chrome DevTools for UI
- Hot reload workflow
- Build configuration (Rollup)

## Testing
- Unit testing with Jest
- Mocking Stream Deck SDK
- Integration testing
- Manual testing
- Cross-platform testing

## Security
- Credential storage (OAuth recommended)
- Input validation
- HTTPS enforcement
- Path traversal prevention
- Rate limiting
- Encryption

## Deployment
- Plugin validation
- Packaging (.streamDeckPlugin)
- Marketplace submission
- Version management
- CI/CD workflows

## Troubleshooting
- Plugin not appearing
- WebSocket connection issues
- Property inspector problems
- Settings persistence
- Build errors
- Plugin crashes

## Advanced Patterns
- Debouncing
- Retry logic
- State machines
- Event emitters
- Singleton services
- Polling
- Observer pattern

## Code Templates
- Counter action
- API integration
- Toggle/multi-state
- Dial/encoder control
- WebSocket client
- File system operations

## Manifest Configuration
- Basic structure
- Multi-action plugins
- Multi-state actions
- Dial actions
- Application monitoring
- Profile bundles

## Complete Examples
- Basic counter plugin (full source)
- API integration plugin
- Multi-action plugin
- Stream Deck + dial plugin
