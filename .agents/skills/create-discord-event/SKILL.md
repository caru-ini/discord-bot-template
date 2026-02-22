---
name: create-discord-event
description: Create and update Discord event handlers for this Bun + TypeScript + discord.js v14 template. Use when the request involves adding a new listener in src/events/, modifying event execution flow, enabling runOnce behavior, or wiring logic that depends on Discord client events.
---

# Create Discord Event

Create one event module that exports `event` and aligns with the template event loader.

## Workflow

1. Confirm event intent.
- Determine target Discord event name, whether it should run once, and expected side effects.

2. Check intent requirements before coding.
- If the event needs extra gateway intents (for example member or message events), update `src/client.ts` in the same task.

3. Choose event file location.
- Use `src/events/<event-name>.ts` for a new listener.
- For complex implementations, prefer barrel-file organization by default: create `src/events/<group>/index.ts`.
- Keep one exported `event` object per file.

4. Implement typed event module.
- Import `Events` from `discord.js` and `Event` from `@/types`.
- Set `name` to a valid `Events.*` member.
- Set `runOnce: true` only for one-time startup-style handlers.
- Keep `execute` async and type-safe for the selected event.

5. Validate behavior.
- Ensure routing compatibility with dynamic loading in `src/utils/core.ts`.
- Run `bun run typecheck`.
- Run `bun run check`.

## Event Template

```typescript
import { Events } from 'discord.js';
import type { Event } from '@/types';

export const event: Event<Events.ClientReady> = {
  name: Events.ClientReady,
  runOnce: true,
  execute: async (client) => {
    // Event logic
  }
};
```

## Constraints

- Use `@/` path aliases for internal imports.
- Export `event` exactly; dynamic loader expects this symbol.
- Keep logging consistent with `logger.child({ name: 'events/<name>' })` for non-trivial handlers.
