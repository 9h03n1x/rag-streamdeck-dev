# Action Templates

## Basic Counter Action

```typescript
import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

type CounterSettings = {
    count: number;
};

@action({ UUID: "com.company.plugin.counter" })
export class CounterAction extends SingletonAction<CounterSettings> {
    override async onWillAppear(ev: WillAppearEvent<CounterSettings>): Promise<void> {
        const { count = 0 } = ev.payload.settings;
        await ev.action.setTitle(`${count}`);
    }
    
    override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
        let { count = 0 } = ev.payload.settings;
        count++;
        
        await ev.action.setSettings({ count });
        await ev.action.setTitle(`${count}`);
        await ev.action.showOk();
    }
}
```

## API Integration Action

```typescript
import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import axios from "axios";

type APISettings = {
    apiKey: string;
    endpoint: string;
};

@action({ UUID: "com.company.plugin.api" })
export class APIAction extends SingletonAction<APISettings> {
    private cache: Map<string, any> = new Map();
    
    override async onWillAppear(ev: WillAppearEvent<APISettings>): Promise<void> {
        await this.updateDisplay(ev);
    }
    
    override async onKeyDown(ev: KeyDownEvent<APISettings>): Promise<void> {
        try {
            const data = await this.fetchData(ev.payload.settings);
            await ev.action.setTitle(data.value);
            await ev.action.showOk();
        } catch (error) {
            streamDeck.logger.error(`API Error: ${error.message}`);
            await ev.action.showAlert();
        }
    }
    
    private async fetchData(settings: APISettings) {
        const { apiKey, endpoint } = settings;
        
        if (!apiKey || !endpoint) {
            throw new Error("API key and endpoint required");
        }
        
        const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${apiKey}` }
        });
        
        return response.data;
    }
    
    private async updateDisplay(ev: WillAppearEvent<APISettings>) {
        try {
            const data = await this.fetchData(ev.payload.settings);
            await ev.action.setTitle(data.value);
        } catch {
            await ev.action.setTitle("Error");
        }
    }
}
```

## Toggle Action (Multi-State)

```typescript
import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

type ToggleSettings = {
    state: number;
};

@action({ UUID: "com.company.plugin.toggle" })
export class ToggleAction extends SingletonAction<ToggleSettings> {
    override async onWillAppear(ev: WillAppearEvent<ToggleSettings>): Promise<void> {
        const { state = 0 } = ev.payload.settings;
        await ev.action.setState(state);
    }
    
    override async onKeyDown(ev: KeyDownEvent<ToggleSettings>): Promise<void> {
        const currentState = ev.payload.state ?? 0;
        const newState = currentState === 0 ? 1 : 0;
        
        await ev.action.setState(newState);
        await ev.action.setSettings({ state: newState });
        
        // Perform action based on state
        if (newState === 1) {
            await this.turnOn();
        } else {
            await this.turnOff();
        }
    }
    
    private async turnOn() {
        // Implementation
    }
    
    private async turnOff() {
        // Implementation
    }
}
```

## Dial/Encoder Action

```typescript
import { action, DialRotateEvent, DialDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

type VolumeSettings = {
    volume: number;
    step: number;
};

@action({ UUID: "com.company.plugin.volume" })
export class VolumeAction extends SingletonAction<VolumeSettings> {
    override async onWillAppear(ev: WillAppearEvent<VolumeSettings>): Promise<void> {
        await this.updateFeedback(ev);
    }
    
    override async onDialRotate(ev: DialRotateEvent<VolumeSettings>): Promise<void> {
        let { volume = 50, step = 5 } = ev.payload.settings;
        
        // Adjust volume based on ticks
        volume += ev.payload.ticks * step;
        volume = Math.max(0, Math.min(100, volume));
        
        await ev.action.setSettings({ volume, step });
        await this.updateFeedback(ev);
        await this.setSystemVolume(volume);
    }
    
    override async onDialDown(ev: DialDownEvent<VolumeSettings>): Promise<void> {
        const { volume = 50 } = ev.payload.settings;
        
        // Toggle mute
        if (volume > 0) {
            await this.setSystemVolume(0);
            await ev.action.setTitle("Muted");
        }
    }
    
    private async updateFeedback(ev: any) {
        const { volume = 50 } = ev.payload.settings;
        
        await ev.action.setFeedback({
            title: `${volume}%`,
            value: volume
        });
    }
    
    private async setSystemVolume(volume: number) {
        // Implementation
    }
}
```

## WebSocket Client Action

```typescript
import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import WebSocket from "ws";

type WSSettings = {
    url: string;
    message: string;
};

@action({ UUID: "com.company.plugin.websocket" })
export class WebSocketAction extends SingletonAction<WSSettings> {
    private ws?: WebSocket;
    
    override async onWillAppear(ev: WillAppearEvent<WSSettings>): Promise<void> {
        await this.connect(ev.payload.settings);
    }
    
    override async onWillDisappear(ev: WillDisappearEvent<WSSettings>): Promise<void> {
        this.disconnect();
    }
    
    override async onKeyDown(ev: KeyDownEvent<WSSettings>): Promise<void> {
        const { message } = ev.payload.settings;
        
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(message);
            await ev.action.showOk();
        } else {
            await ev.action.showAlert();
        }
    }
    
    private async connect(settings: WSSettings) {
        const { url } = settings;
        
        if (!url) return;
        
        this.ws = new WebSocket(url);
        
        this.ws.on('open', () => {
            streamDeck.logger.info('WebSocket connected');
        });
        
        this.ws.on('message', (data) => {
            streamDeck.logger.info(`Received: ${data}`);
        });
        
        this.ws.on('error', (error) => {
            streamDeck.logger.error(`WebSocket error: ${error.message}`);
        });
    }
    
    private disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }
    }
}
```

## File System Action

```typescript
import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { promises as fs } from "fs";
import path from "path";

type FileSettings = {
    filePath: string;
    content: string;
};

@action({ UUID: "com.company.plugin.file" })
export class FileAction extends SingletonAction<FileSettings> {
    override async onKeyDown(ev: KeyDownEvent<FileSettings>): Promise<void> {
        const { filePath, content } = ev.payload.settings;
        
        try {
            await this.writeFile(filePath, content);
            await ev.action.showOk();
        } catch (error) {
            streamDeck.logger.error(`File error: ${error.message}`);
            await ev.action.showAlert();
        }
    }
    
    private async writeFile(filePath: string, content: string) {
        const absolutePath = path.resolve(filePath);
        await fs.writeFile(absolutePath, content, 'utf-8');
    }
}
```
