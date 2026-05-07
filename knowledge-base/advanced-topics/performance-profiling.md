# Performance Profiling

## Overview

Stream Deck plugins run as long-lived Node.js processes. Performance problems manifest as slow key responses, high memory growth over time, or UI lag. This guide covers how to measure, profile, and optimise plugin performance.

## Key Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Action response time (key press → visual feedback) | < 100ms | Timestamp in `onKeyDown` / `setTitle` |
| Plugin startup time | < 500ms | Time from start to `streamDeck.connect()` |
| Memory usage (heap) | < 100MB steady state | `process.memoryUsage().heapUsed` |
| Memory growth per hour | < 5MB | Periodic heap snapshots |
| API call duration | < 1s | `performance.now()` around fetch |
| Image generation time | < 50ms | Timestamp canvas operations |
| CPU idle | > 90% | CPU profiler |

## Built-in Performance Logging

Add a lightweight perf logger at startup to watch for regressions:

```typescript
// utils/perfMonitor.ts
class PerfMonitor {
    private snapshots: Array<{ time: number; heap: number }> = [];

    start(intervalMs = 60_000) {
        setInterval(() => {
            const { heapUsed, heapTotal, external, rss } = process.memoryUsage();
            const snapshot = {
                time: Date.now(),
                heap: heapUsed,
            };
            this.snapshots.push(snapshot);
            if (this.snapshots.length > 60) this.snapshots.shift();

            streamDeck.logger.debug(
                `Memory — heap: ${mb(heapUsed)}/${mb(heapTotal)} MB, ` +
                `external: ${mb(external)} MB, rss: ${mb(rss)} MB`
            );

            // Warn if heap has grown by > 20MB over the last 10 samples
            if (this.snapshots.length >= 10) {
                const oldest = this.snapshots[this.snapshots.length - 10];
                const growth = heapUsed - oldest.heap;
                if (growth > 20 * 1024 * 1024) {
                    streamDeck.logger.warn(
                        `Possible memory leak: heap grew ${mb(growth)} MB in the last 10 minutes`
                    );
                }
            }
        }, intervalMs);
    }
}

function mb(bytes: number) { return Math.round(bytes / 1024 / 1024); }

export const perfMonitor = new PerfMonitor();

// In main entry point, before streamDeck.connect():
perfMonitor.start();
```

## Action Response Time

Measure the round-trip from key press to visual update:

```typescript
override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    const t0 = performance.now();

    await this.doWork(ev);
    await ev.action.setTitle("Done");

    const elapsed = performance.now() - t0;
    streamDeck.logger.debug(`onKeyDown took ${Math.round(elapsed)}ms`);
    if (elapsed > 200) {
        streamDeck.logger.warn(`Slow key handler: ${Math.round(elapsed)}ms`);
    }
}
```

## Node.js CPU Profiling

### Method 1: `--prof` Flag

Enable V8's built-in CPU profiler by adding the flag to your `manifest.json`:

```json
{
    "Nodejs": {
        "Version": "24",
        "Debug": "--prof"
    }
}
```

This produces an `isolate-*.log` file. Process it with:

```bash
node --prof-process isolate-*.log > profile.txt
```

Look for functions consuming significant "self" time in the output.

### Method 2: Inspector Protocol (Remote Profiling)

```json
{
    "Nodejs": {
        "Version": "24",
        "Debug": "--inspect=0.0.0.0:9229"
    }
}
```

Then in Chrome DevTools:
1. Navigate to `chrome://inspect`
2. Click "Open dedicated DevTools for Node"
3. Go to the **Profiler** tab
4. Click **Start** → trigger the slow operation → **Stop**
5. Inspect the flame chart for hot paths

### Method 3: Manual CPU Timing

Profile specific functions without external tools:

```typescript
function profileSync<T>(label: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    streamDeck.logger.debug(`${label}: ${(performance.now() - start).toFixed(2)}ms`);
    return result;
}

async function profileAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    streamDeck.logger.debug(`${label}: ${(performance.now() - start).toFixed(2)}ms`);
    return result;
}

// Usage
const icon = profileSync("renderIcon", () => drawIcon(settings));
const data = await profileAsync("fetchData", () => api.getData());
```

## Memory Profiling

### Heap Snapshots via Chrome DevTools

1. Enable inspect mode (see above)
2. In Chrome DevTools → **Memory** tab
3. Take a **Heap snapshot** baseline
4. Trigger the operation you suspect leaks memory
5. Take another snapshot
6. Use **Comparison** view to find objects that grew

### Detecting Memory Leaks in Code Review

Common memory leak patterns in plugins:

```typescript
// BAD: Event listener added in onWillAppear but never removed
override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    someEmitter.on("event", this.handler); // LEAK: re-added every appearance
}

// GOOD: Track and remove in onWillDisappear
private boundHandler = this.handler.bind(this);

override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    someEmitter.on("event", this.boundHandler);
}

override onWillDisappear(_ev: WillDisappearEvent<Settings>): void {
    someEmitter.off("event", this.boundHandler);
}
```

```typescript
// BAD: setInterval never cleared
override onWillAppear(ev: WillAppearEvent<Settings>): void {
    setInterval(() => this.refresh(ev.action), 5000); // LEAK: accumulates on each appearance
}

// GOOD: Track timer and clear it
private refreshTimer?: NodeJS.Timeout;

override onWillAppear(ev: WillAppearEvent<Settings>): void {
    this.refreshTimer = setInterval(() => this.refresh(ev.action), 5000);
}

override onWillDisappear(_ev: WillDisappearEvent<Settings>): void {
    clearInterval(this.refreshTimer);
    this.refreshTimer = undefined;
}
```

```typescript
// BAD: Unbounded cache growth
const cache = new Map<string, Buffer>();

function getImage(key: string): Buffer {
    if (!cache.has(key)) cache.set(key, renderImage(key)); // grows forever
    return cache.get(key)!;
}

// GOOD: LRU cache with size limit
class LRUCache<K, V> {
    private map = new Map<K, V>();
    constructor(private readonly maxSize: number) {}

    get(key: K): V | undefined {
        if (!this.map.has(key)) return undefined;
        const val = this.map.get(key)!;
        this.map.delete(key);
        this.map.set(key, val); // move to end (most recent)
        return val;
    }

    set(key: K, value: V): void {
        this.map.delete(key);
        this.map.set(key, value);
        if (this.map.size > this.maxSize) {
            this.map.delete(this.map.keys().next().value); // evict oldest
        }
    }
}

const imageCache = new LRUCache<string, Buffer>(50); // max 50 entries
```

## Network Performance Optimisation

### Reduce `setImage` Frequency

`setImage` serialises a PNG to base64 and sends it over WebSocket. Excessive calls are a common source of lag:

```typescript
// BAD: Updating image on every data point
dataStream.on("data", async (value) => {
    await action.setImage(renderGauge(value)); // could be 10/sec
});

// GOOD: Throttle to max 4 updates/second
import { throttle } from "lodash"; // or implement yourself

const updateImage = throttle(async (action: Action, value: number) => {
    await action.setImage(renderGauge(value));
}, 250);

dataStream.on("data", (value) => updateImage(action, value));
```

### Cache Rendered Images

```typescript
const renderCache = new LRUCache<string, string>(100); // key → base64 PNG

async function setCachedImage(action: Action, key: string, renderFn: () => string) {
    let image = renderCache.get(key);
    if (!image) {
        image = renderFn();
        renderCache.set(key, image);
    }
    await action.setImage(image);
}

// Usage: only re-render when value actually changes
await setCachedImage(action, `temp:${Math.round(temp)}`, () => renderTemp(temp));
```

## Canvas / Image Generation Performance

### Reuse Canvas Instances

Creating a new canvas on every call is expensive:

```typescript
import { createCanvas, Canvas, CanvasRenderingContext2D } from "canvas";

// Create once, reuse
const canvas = createCanvas(72, 72);
const ctx = canvas.getContext("2d");

function renderIcon(text: string): string {
    // Clear and redraw on the same canvas
    ctx.clearRect(0, 0, 72, 72);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, 72, 72);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 36, 36);
    return canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
}
```

### Prefer SVG for Simple Icons

SVG string manipulation is faster than canvas rendering for simple icons:

```typescript
function renderCounterSVG(count: number, color = "#ffffff"): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
        <rect width="72" height="72" fill="#1a1a2e"/>
        <text x="36" y="36" font-family="sans-serif" font-size="28" font-weight="bold"
              fill="${color}" text-anchor="middle" dominant-baseline="central">${count}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
```

## Lazy Loading

Defer expensive initialisation until the first action appears:

```typescript
let serviceClient: HeavyServiceClient | undefined;

function getServiceClient(): HeavyServiceClient {
    if (!serviceClient) {
        serviceClient = new HeavyServiceClient(); // initialised only when needed
    }
    return serviceClient;
}

@action({ UUID: "com.example.plugin.myaction" })
export class MyAction extends SingletonAction<Settings> {
    override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
        // Client created on first use, not at plugin startup
        const client = getServiceClient();
        await client.connect();
    }
}
```

## Debouncing and Throttling

```typescript
// Debounce: wait until activity stops (e.g., after the last keystroke)
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
    let timer: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    }) as T;
}

// Throttle: limit to once per interval (e.g., sensor readings)
function throttle<T extends (...args: any[]) => any>(fn: T, interval: number): T {
    let last = 0;
    return ((...args: Parameters<T>) => {
        const now = Date.now();
        if (now - last >= interval) {
            last = now;
            fn(...args);
        }
    }) as T;
}

// Usage
const saveSettings = debounce(
    (action: Action, settings: Settings) => action.setSettings(settings),
    300
);
const updateDisplay = throttle(
    (action: Action, value: number) => action.setTitle(String(value)),
    100 // max 10 updates/second
);
```

## Benchmarking

### Simple Microbenchmark

```typescript
async function benchmark(
    label: string,
    fn: () => void | Promise<void>,
    iterations = 1000
): Promise<void> {
    // Warmup
    for (let i = 0; i < 10; i++) await fn();

    const start = performance.now();
    for (let i = 0; i < iterations; i++) await fn();
    const elapsed = performance.now() - start;

    streamDeck.logger.info(
        `[Benchmark] ${label}: ${(elapsed / iterations).toFixed(3)}ms/op ` +
        `(${Math.round(1000 / (elapsed / iterations))}/sec)`
    );
}

// Usage in test/bench.ts (run manually)
await benchmark("renderIcon-canvas", () => renderIcon("42"));
await benchmark("renderIcon-svg",    () => renderCounterSVG(42));
```

## Performance Optimisation Checklist

- [ ] Timers (`setInterval`, `setTimeout`) cleaned up in `onWillDisappear`
- [ ] Event listeners removed in `onWillDisappear`
- [ ] `setImage` calls throttled to ≤ 4/second per action
- [ ] Canvas instances reused rather than recreated per frame
- [ ] API responses cached with appropriate TTL
- [ ] Heavy initialisation deferred (lazy loading)
- [ ] No unbounded `Map` / `Array` growth (use LRU cache)
- [ ] `fetch` calls have timeouts to prevent open handles
- [ ] Heap monitored in production; alert on unexpected growth
- [ ] CPU profile run on the most-called code paths

---

**Related Documentation**:
- [Testing Strategies](../development-workflow/testing-strategies.md)
- [Debugging Guide](../development-workflow/debugging-guide.md)
- [Network Operations](./network-operations.md)
