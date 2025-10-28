# Common Patterns

## Debounced Updates

```typescript
class DebouncedAction extends SingletonAction {
    private timers: Map<string, NodeJS.Timeout> = new Map();
    
    override async onDialRotate(ev: DialRotateEvent) {
        const context = ev.context;
        
        // Clear existing timer
        if (this.timers.has(context)) {
            clearTimeout(this.timers.get(context)!);
        }
        
        // Set new timer
        this.timers.set(context, setTimeout(async () => {
            await this.performUpdate(ev);
            this.timers.delete(context);
        }, 300));
    }
    
    private async performUpdate(ev: DialRotateEvent) {
        // Actual update logic
    }
}
```

## Retry Logic

```typescript
async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    throw new Error('Max retries exceeded');
}

// Usage
override async onKeyDown(ev: KeyDownEvent) {
    try {
        const data = await retryOperation(() => fetchData());
        await ev.action.setTitle(data.value);
    } catch (error) {
        await ev.action.showAlert();
    }
}
```

## State Machine

```typescript
enum State {
    Idle,
    Loading,
    Success,
    Error
}

class StateMachineAction extends SingletonAction {
    private states: Map<string, State> = new Map();
    
    override async onKeyDown(ev: KeyDownEvent) {
        const context = ev.context;
        const currentState = this.states.get(context) ?? State.Idle;
        
        switch (currentState) {
            case State.Idle:
                await this.transition(context, State.Loading, ev.action);
                await this.performOperation(context, ev.action);
                break;
                
            case State.Loading:
                // Ignore while loading
                break;
                
            case State.Success:
                await this.transition(context, State.Idle, ev.action);
                break;
                
            case State.Error:
                await this.transition(context, State.Idle, ev.action);
                break;
        }
    }
    
    private async transition(context: string, newState: State, action: Action) {
        this.states.set(context, newState);
        await this.updateDisplay(newState, action);
    }
    
    private async updateDisplay(state: State, action: Action) {
        switch (state) {
            case State.Loading:
                await action.setTitle("Loading...");
                break;
            case State.Success:
                await action.showOk();
                break;
            case State.Error:
                await action.showAlert();
                break;
        }
    }
    
    private async performOperation(context: string, action: Action) {
        try {
            await someAsyncOperation();
            await this.transition(context, State.Success, action);
        } catch (error) {
            await this.transition(context, State.Error, action);
        }
    }
}
```

## Event Emitter Pattern

```typescript
import { EventEmitter } from 'events';

class DataService extends EventEmitter {
    private data: any;
    
    async fetchData() {
        try {
            this.data = await fetch('...');
            this.emit('dataUpdated', this.data);
        } catch (error) {
            this.emit('error', error);
        }
    }
}

const dataService = new DataService();

@action({ UUID: "com.company.action" })
class MyAction extends SingletonAction {
    constructor() {
        super();
        dataService.on('dataUpdated', this.onDataUpdated.bind(this));
        dataService.on('error', this.onError.bind(this));
    }
    
    private async onDataUpdated(data: any) {
        this.actions.forEach(action => {
            action.setTitle(data.value);
        });
    }
    
    private async onError(error: Error) {
        streamDeck.logger.error(error.message);
    }
}
```

## Singleton Service

```typescript
class APIService {
    private static instance: APIService;
    private cache: Map<string, any> = new Map();
    
    private constructor() {}
    
    static getInstance(): APIService {
        if (!APIService.instance) {
            APIService.instance = new APIService();
        }
        return APIService.instance;
    }
    
    async getData(key: string): Promise<any> {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const data = await fetch(`https://api.example.com/${key}`);
        this.cache.set(key, data);
        return data;
    }
    
    clearCache() {
        this.cache.clear();
    }
}

// Usage
const api = APIService.getInstance();
```

## Polling Pattern

```typescript
class PollingAction extends SingletonAction {
    private intervals: Map<string, NodeJS.Timeout> = new Map();
    
    override async onWillAppear(ev: WillAppearEvent) {
        this.startPolling(ev.context, ev.action);
    }
    
    override async onWillDisappear(ev: WillDisappearEvent) {
        this.stopPolling(ev.context);
    }
    
    private startPolling(context: string, action: Action) {
        const interval = setInterval(async () => {
            try {
                const data = await this.fetchData();
                await action.setTitle(data.value);
            } catch (error) {
                streamDeck.logger.error(error.message);
            }
        }, 5000); // Poll every 5 seconds
        
        this.intervals.set(context, interval);
    }
    
    private stopPolling(context: string) {
        const interval = this.intervals.get(context);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(context);
        }
    }
    
    private async fetchData() {
        // Fetch logic
    }
}
```

## Observer Pattern

```typescript
interface Observer {
    update(data: any): void;
}

class DataSubject {
    private observers: Observer[] = [];
    
    subscribe(observer: Observer) {
        this.observers.push(observer);
    }
    
    unsubscribe(observer: Observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    
    notify(data: any) {
        this.observers.forEach(observer => observer.update(data));
    }
}

@action({ UUID: "com.company.action" })
class MyAction extends SingletonAction implements Observer {
    constructor(private subject: DataSubject) {
        super();
        subject.subscribe(this);
    }
    
    update(data: any) {
        this.actions.forEach(action => {
            action.setTitle(data.value);
        });
    }
}
```
