# Common Issues

## Plugin Not Appearing

**Symptoms**: Plugin doesn't show in Stream Deck after install

**Solutions**:
1. Check Stream Deck is running
2. Restart Stream Deck application
3. Verify plugin in correct location
4. Check manifest.json syntax
5. Check CodePath points to correct file
6. View logs: `streamdeck logs <UUID>`

## WebSocket Connection Failed

**Symptoms**: Plugin starts but doesn't receive events

**Solutions**:
1. Check `streamDeck.connect()` is called
2. Verify all actions registered before connect
3. Check logs for connection errors
4. Ensure port not blocked by firewall

## Property Inspector Not Showing

**Symptoms**: UI doesn't appear when action selected

**Solutions**:
1. Check PropertyInspectorPath in manifest
2. Verify HTML file exists at path
3. Open http://localhost:23654/ to debug
4. Check browser console for errors
5. Ensure sdpi-components script loaded

## Settings Not Persisting

**Symptoms**: Settings reset after restart

**Solutions**:
1. Ensure using `setSettings()` not local variables
2. Check settings structure matches type
3. Verify JSON serializable
4. Check for errors in console

## Action Not Updating

**Symptoms**: Title/image doesn't change

**Solutions**:
1. Check action context is correct
2. Ensure async/await used properly
3. Verify no errors in try-catch
4. Check rate limiting (max 10/sec)

## Button Opens Wrong Item (Previous/Stale Target)

**Symptoms**: Action title/image shows item A, but pressing the key opens item B (often the previous or just-ended item)

**Typical Root Cause**:
1. Render path (`updateDisplay`) and interaction path (`onKeyDown`/`onTouchTap`) use different selection logic
2. Press handler ignores offset/index settings used by display
3. Fallback logic (`getCurrent`/`getNext`) diverges from the rendered list
4. Multi-source data (cached list vs direct getter) is not aligned

**Fix Pattern**:
1. Extract one selector function (e.g. `resolveTarget(settings, data)`) and call it from both render and press paths
2. Use the same data source and filters (offset, all-day exclusion, include-all-calendars) for both paths
3. Read live settings before periodic updates and press handling when stale closures are possible
4. Add debug logs with selected item ID + offset in both render and interaction paths
5. Add regression test: "displayed target ID equals opened target ID"

**Quick Verification**:
1. Create back-to-back events and set offset = 0/1/2
2. Confirm visible title and opened URL always map to the same event ID
3. Repeat across boundary times (meeting just ended / next just started)

## Build Errors

**Symptoms**: TypeScript compilation fails

**Solutions**:
1. Run `npm install`
2. Check tsconfig.json
3. Verify TypeScript version
4. Clear node_modules and reinstall

## Plugin Crashes

**Symptoms**: Plugin repeatedly restarts

**Solutions**:
1. Check logs for error stack trace
2. Add try-catch to event handlers
3. Check for unhandled rejections
4. Verify Node.js version matches manifest
