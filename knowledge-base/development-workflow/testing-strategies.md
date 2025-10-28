# Testing Strategies

## Testing Overview

Stream Deck plugins should be tested at multiple levels:
1. Unit tests (business logic)
2. Integration tests (SDK interactions)
3. Manual tests (user flows)
4. Cross-platform tests (Windows/macOS)

## Unit Testing

### Setup Jest

```bash
npm install -D jest @types/jest ts-jest

# Initialize Jest
npx ts-jest config:init
```

### Jest Configuration

`jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Example Unit Tests

```typescript
// src/utils/counter.ts
export class Counter {
    private count = 0;
    
    increment(): number {
        return ++this.count;
    }
    
    decrement(): number {
        return --this.count;
    }
    
    reset(): void {
        this.count = 0;
    }
    
    getValue(): number {
        return this.count;
    }
}

// tests/utils/counter.test.ts
import { Counter } from '../../src/utils/counter';

describe('Counter', () => {
    let counter: Counter;
    
    beforeEach(() => {
        counter = new Counter();
    });
    
    test('should start at 0', () => {
        expect(counter.getValue()).toBe(0);
    });
    
    test('should increment', () => {
        counter.increment();
        expect(counter.getValue()).toBe(1);
    });
    
    test('should decrement', () => {
        counter.decrement();
        expect(counter.getValue()).toBe(-1);
    });
    
    test('should reset', () => {
        counter.increment();
        counter.increment();
        counter.reset();
        expect(counter.getValue()).toBe(0);
    });
});
```

## Mocking Stream Deck SDK

### Mock streamDeck

```typescript
// tests/mocks/streamdeck.ts
export const mockStreamDeck = {
    logger: {
        trace: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    },
    actions: {
        registerAction: jest.fn(),
        forEach: jest.fn()
    },
    connect: jest.fn(),
    settings: {
        setGlobalSettings: jest.fn(),
        getGlobalSettings: jest.fn()
    },
    system: {
        openUrl: jest.fn()
    }
};

// Usage in tests
jest.mock('@elgato/streamdeck', () => ({
    __esModule: true,
    default: mockStreamDeck
}));
```

### Mock Action Events

```typescript
// tests/mocks/events.ts
export function createMockKeyDownEvent(settings = {}): KeyDownEvent {
    return {
        action: {
            id: 'mock-action-id',
            manifestId: 'com.company.action',
            isKey: () => true,
            isDial: () => false,
            setTitle: jest.fn().mockResolvedValue(undefined),
            setImage: jest.fn().mockResolvedValue(undefined),
            setSettings: jest.fn().mockResolvedValue(undefined),
            getSettings: jest.fn().mockResolvedValue(settings),
            showAlert: jest.fn().mockResolvedValue(undefined),
            showOk: jest.fn().mockResolvedValue(undefined),
            setState: jest.fn().mockResolvedValue(undefined)
        },
        context: 'mock-context',
        device: {
            id: 'mock-device',
            name: 'Stream Deck',
            type: 0,
            size: { columns: 5, rows: 3 }
        },
        payload: {
            settings,
            coordinates: { column: 0, row: 0 },
            state: 0,
            isInMultiAction: false,
            controller: 'Keypad' as const
        }
    } as any;
}
```

## Testing Actions

```typescript
// tests/actions/counter.test.ts
import { Counter } from '../../src/actions/counter';
import { createMockKeyDownEvent } from '../mocks/events';

describe('Counter Action', () => {
    let action: Counter;
    
    beforeEach(() => {
        action = new Counter();
    });
    
    test('should increment count on key down', async () => {
        const settings = { count: 5 };
        const event = createMockKeyDownEvent(settings);
        
        await action.onKeyDown(event);
        
        expect(event.action.setSettings).toHaveBeenCalledWith({
            count: 6
        });
    });
    
    test('should handle missing count', async () => {
        const event = createMockKeyDownEvent({});
        
        await action.onKeyDown(event);
        
        expect(event.action.setSettings).toHaveBeenCalledWith({
            count: 1
        });
    });
    
    test('should show alert on error', async () => {
        const event = createMockKeyDownEvent({});
        jest.spyOn(event.action, 'setSettings')
            .mockRejectedValue(new Error('Test error'));
        
        await action.onKeyDown(event);
        
        expect(event.action.showAlert).toHaveBeenCalled();
    });
});
```

## Integration Testing

### Test Stream Deck Communication

```typescript
// tests/integration/plugin.test.ts
describe('Plugin Integration', () => {
    test('should register all actions', () => {
        const registerSpy = jest.spyOn(streamDeck.actions, 'registerAction');
        
        // Import plugin (triggers registration)
        require('../../src/plugin');
        
        expect(registerSpy).toHaveBeenCalledTimes(3);
    });
    
    test('should connect to Stream Deck', () => {
        const connectSpy = jest.spyOn(streamDeck, 'connect');
        
        require('../../src/plugin');
        
        expect(connectSpy).toHaveBeenCalled();
    });
});
```

## Manual Testing

### Test Plan Template

```markdown
# Plugin Test Plan

## Setup
- [ ] Install plugin on Windows
- [ ] Install plugin on macOS
- [ ] Configure Stream Deck device

## Functional Tests

### Action 1: Counter
- [ ] Action appears in actions list
- [ ] Icon displays correctly
- [ ] Title displays correctly
- [ ] Press increments counter
- [ ] Counter persists across restarts
- [ ] Property inspector opens
- [ ] Settings save correctly

### Action 2: API Integration
- [ ] API connection established
- [ ] Data fetched correctly
- [ ] Error handling works
- [ ] Rate limiting respected
- [ ] Offline mode works

## UI Tests
- [ ] Property inspector displays
- [ ] All form fields work
- [ ] Validation messages show
- [ ] Settings persist
- [ ] Help links work

## Error Handling
- [ ] Invalid settings handled
- [ ] Network errors handled
- [ ] API errors handled
- [ ] Graceful degradation

## Performance
- [ ] Plugin starts quickly (<3s)
- [ ] Actions respond immediately (<100ms)
- [ ] Memory usage stable
- [ ] CPU usage minimal

## Cross-Platform
- [ ] Works on Windows 10
- [ ] Works on Windows 11
- [ ] Works on macOS 10.15+
- [ ] Paths correct for both platforms
```

### Automated Manual Tests

```typescript
// scripts/test-actions.ts
import streamDeck from '@elgato/streamdeck';
import { MyAction } from '../src/actions/my-action';

async function testAction() {
    const action = new MyAction();
    
    // Simulate key down
    const mockEvent = createMockKeyDownEvent();
    await action.onKeyDown(mockEvent);
    
    console.log('✓ Key down handled');
    
    // Simulate settings change
    await action.onDidReceiveSettings(createMockSettingsEvent());
    
    console.log('✓ Settings handled');
}

testAction().catch(console.error);
```

## Test Coverage

### Generate Coverage Report

```bash
npm test -- --coverage
```

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageReporters: ['text', 'html', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Continuous Integration

### GitHub Actions

```.yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## Best Practices

1. **Test First**: Write tests before code (TDD)
2. **Mock External**: Mock SDK and external services
3. **Test Edge Cases**: Null, undefined, invalid inputs
4. **Integration Tests**: Test real SDK integration
5. **Manual Testing**: Always test manually before release
6. **Cross-Platform**: Test on both Windows and macOS
7. **Performance**: Monitor memory and CPU usage
8. **Regression**: Keep old tests for regression testing
