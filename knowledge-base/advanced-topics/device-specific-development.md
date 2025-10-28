# Device-Specific Development

> **Status**: 🚧 Documentation in progress

## Overview

Developing for different Stream Deck device types and handling device-specific features.

## Supported Devices

### Stream Deck Classic
- 15 keys (5 columns × 3 rows)
- 72×72 px key icons

### Stream Deck Mini
- 6 keys (3 columns × 2 rows)
- 80×80 px key icons

### Stream Deck XL
- 32 keys (8 columns × 4 rows)
- 96×96 px key icons

### Stream Deck +
- 8 keys + 4 dials with touchscreens
- See: [Stream Deck Plus Deep Dive](../core-concepts/stream-deck-plus-deep-dive.md)

### Stream Deck Mobile
**Coming soon**: Mobile-specific features and limitations

### Stream Deck Pedal
**Coming soon**: Pedal-specific development

### Stream Deck Neo
**Coming soon**: Neo-specific features

## Device Detection

### Runtime Detection

```typescript
// Example pattern - full documentation coming soon
import { streamDeck, DeviceType } from "@elgato/streamdeck";

override async onWillAppear(ev: WillAppearEvent) {
    const deviceType = ev.device.type;
    
    switch (deviceType) {
        case DeviceType.StreamDeck:
            // Standard Stream Deck
            break;
        case DeviceType.StreamDeckMini:
            // Mini-specific logic
            break;
        case DeviceType.StreamDeckXL:
            // XL-specific logic
            break;
        case DeviceType.StreamDeckPlus:
            // Plus-specific logic
            break;
        // ... other devices
    }
}
```

### Device Capabilities

**Coming soon**: Querying device capabilities

## Responsive Design

### Adaptive Layouts

**Coming soon**: Layouts that adapt to device size

### Icon Sizing

**Coming soon**: Optimal icon sizes per device

## Device-Specific Features

### Stream Deck Mobile

**Coming soon**: Mobile platform considerations
- Touch interactions
- Screen size variations
- Performance considerations
- Battery impact

### Stream Deck Pedal

**Coming soon**: Pedal-specific patterns
- Foot control ergonomics
- Action duration considerations
- Accessibility features

### Stream Deck Neo

**Coming soon**: Neo-specific features
- New hardware capabilities
- Layout considerations

## Fallback Strategies

### Feature Detection

**Coming soon**: Graceful degradation patterns

### Unsupported Device Handling

**Coming soon**: How to handle unsupported devices

## Multi-Device Testing

**Coming soon**: Testing across multiple devices

## Best Practices

**Coming soon**: Device-specific best practices

---

**Related Documentation**:
- [Stream Deck Plus Deep Dive](../core-concepts/stream-deck-plus-deep-dive.md)
- [API Reference](../reference/api-reference.md)
