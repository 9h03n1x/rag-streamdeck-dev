---
category: examples
title: Calendar Dial Carousel With Stacked Cards
tags: [stream-deck-plus, dial, layout, svg, carousel, calendar]
difficulty: advanced
sdk-version: v2
related-files: [core-concepts/stream-deck-plus-deep-dive.md, development-workflow/build-and-deploy.md]
description: Real-world example of using a custom layout and SVG renderer to show a carousel of calendar items on a Stream Deck Plus dial using a stacked card design.
---

# Calendar Dial Carousel With Stacked Cards

## Overview

This pattern comes from a real-world calendar plugin ("Meeting Rotator" style action) for **Stream Deck Plus**. The action lets the user rotate through all meetings for the day on a dial. The touchscreen above the dial shows a **stack of cards**:

- The **front card** shows the currently selected meeting.
- Up to **three cards behind** hint that more meetings are available.
- The background outside the cards is **transparent**.

The goal is to give a strong "carousel" feel without adding extra UI controls.

## Layout and Rendering Strategy

- **Controller**: `Encoder` (dial) only
- **Layout**: Custom layout with a single `pixmap` item covering the full 200×100 canvas
- **Rendering**: The plugin renders a 200×100 SVG and passes it as a data URL to the `canvas` feedback key.

Key files in the example implementation:

- Dial layout: `layouts/meeting-rotator.json`
- SVG renderer: `src/services/svg-renderer.ts`
- Dial action logic: `src/actions/meeting-rotator.ts`

### Custom Layout (Encoder)

```json
{
  "id": "calendar-scout-meeting-rotator",
  "items": [
    { "key": "canvas", "type": "pixmap", "rect": [0, 0, 200, 100] }
  ]
}
```

The action calls:

```ts
action.setFeedbackLayout("layouts/meeting-rotator.json");
action.setFeedback({ canvas: svgDataUrl });
```

## Data Model for the Carousel

The dial action tracks **where we are in the list** and passes that into the renderer:

- `currentIndex` – zero-based index of the selected meeting
- `totalMeetings` – total meetings for the current day

These are stored per action context and updated on `onDialRotate`:

```ts
currentIndex += ticks; // wrap around 0..total-1

await this.renderState(context, {
  state,
  title: meeting.subject,
  subtitle, // e.g. "2 of 5" when enabled
  time: timeText,
  hasOnlineMeeting: meeting.isOnlineMeeting,
  provider,
  currentIndex,
  totalMeetings: meetings.length
});
```

`SVGRenderOptions` is extended to include these optional fields (keys/dials share the same renderer, but only the dial path uses them).

## SVG Design: Front Card + Stack

### Front Card

The dial SVG uses a dedicated **front card** that fills most of the 200×100 canvas, leaving a small margin:

- Rounded rectangle (`rx`/`ry`) with the **state gradient** as fill.
- Drawn **after** the background stack so it sits on top.
- Text and icons (title, time, index, provider logo, camera icon) are drawn inside this card.

### Stacked Cards Behind

Behind the front card, the renderer draws up to **three additional cards** based on how many meetings remain **after** the current one:

```ts
const remaining = Math.max(totalMeetings - currentIndex - 1, 0);
const visibleCards = Math.min(remaining, 3);

for (let i = visibleCards; i >= 1; i--) {
  const step = visibleCards - i + 1;
  const offsetX = step * 4;
  const offsetY = step * 3;
  const strokeOpacity = 0.3 + step * 0.1;  // 0.4..0.6
  const fillOpacity = 0.18 + step * 0.08;   // ~0.26..0.42

  // Rounded rect using state colors
  <rect
    x={baseX + offsetX}
    y={baseY + offsetY}
    width={cardWidth}
    height={cardHeight}
    rx="10" ry="10"
    fill={colors.background} fill-opacity={fillOpacity}
    stroke={colors.text} stroke-opacity={strokeOpacity}
  />
}
```

Important properties:

- **Color source**: Uses the current meeting state's `background` and `text` colors.
- **Opacity**: Low `fill-opacity` ensures the front card remains visually dominant.
- **Offset**: Each card is shifted down/right a few pixels to create the stack illusion.
- **Limit**: Stack is capped at 3 cards to avoid clutter.

### Transparent Outside Area

A crucial detail: there is **no full-screen background rect** for the dial SVG. Only the cards themselves draw pixels. This keeps the area outside the card stack transparent and lets the dial UI feel lighter.

## UX Guidelines and Learnings

1. **Use both text and visuals**
   - The stack communicates "there are more meetings ahead".
   - The optional subtitle ("2 of 5") gives precise context.

2. **Scale with remaining items**
   - The number of back cards is derived from `remaining = total - currentIndex - 1`.
   - When the user reaches the last meeting, the stack disappears (no upcoming items).

3. **Keep content inside safe margins**
   - Size the front card so all text/icons fit well inside (e.g., 10–16px margins).
   - Adjust provider logo and time positions so they do not clip the rounded corners.

4. **Make the dial feel responsive**
   - Bypass throttling when handling `onDialRotate` so the carousel updates instantly.
   - Continue to throttle background refreshes (polling, countdown updates) as needed.

5. **Generalize beyond calendars**
   - The same stacked card pattern works for any **scrollable collection** on a dial: tracks in a playlist, scenes, profiles, etc.

## When to Use This Pattern

Use a stacked card dial carousel when:

- You are presenting a **sequence** of items on a Stream Deck Plus dial.
- The user needs a **quick sense of how many items remain**.
- You want a rich UI but still keep layout wiring simple (single `pixmap` + SVG).

For low-complexity lists or when you only show a single item, a flat card without the stack is usually sufficient.

