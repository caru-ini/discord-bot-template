## Overview

A **type-safe Discord Bot template** built with Bun + TypeScript + discord.js.
Uses dynamic loading to auto-discover commands and events, enabling extension with minimal boilerplate.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Bun | Runtime & package manager |
| TypeScript | Type safety |
| discord.js v14 | Discord API wrapper |
| Zod + @t3-oss/env-core | Environment variable validation |
| Biome | Linter & formatter |
| Pino | Logging |

---

## Directory Structure

```
src/
├── index.ts          # Entry point
├── client.ts         # Discord Client setup
├── env.ts            # Environment variable schema
├── types.d.ts        # Type definitions
├── deploy.ts         # Command deployment script
├── commands/         # Slash commands
├── events/           # Event handlers
└── utils/            # Utilities
```

---

## File Responsibilities

### `src/index.ts`
**Entry point**. On startup:
1. Sets up global error handlers
2. Dynamically loads commands → stores in `client.commands` Collection
3. Dynamically loads events → registers with `client.on/once`
4. Logs into Discord

### `src/client.ts`
**Discord Client singleton**. Configures required Intents.
- Default: only `Guilds` enabled
- For message content: add `GuildMessages`, `MessageContent`

### `src/env.ts`
**Environment variable validation**. Type-safe with Zod schema.
```typescript
// Required
DISCORD_BOT_TOKEN: string
DISCORD_APPLICATION_ID: string

// Optional
DISCORD_GUILD_ID?: string  // For slash command deployment on guild
LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error'
```

### `src/types.d.ts`
**Type definitions**.
- `Command<T>`: Command definition type
- `Event<T>`: Event definition type
- `Client.commands`: discord.js Client extension

### `src/deploy.ts`
**Command deployment script**.
- `--global` flag: Global deploy (production, up to 1 hour to propagate)
- No flag: Guild deploy (development, instant, requires `DISCORD_GUILD_ID`)

---

## `src/commands/` - Adding Commands

### File Structure
- **Single file**: `src/commands/hello.ts` → Filename is not required to match command name
- **Barrel file**: `src/commands/admin/index.ts` → Useful for organizing complex commands

### Template

```typescript
import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '@/types';

export const command: Command<ChatInputCommandInteraction> = {
  data: new SlashCommandBuilder()
    .setName('commandname')
    .setDescription('Command description'),
  execute: async (interaction) => {
    await interaction.reply('Response');
  }
};
```

### Best Practices
- **Always export as `command`**
- Use `MessageFlags.Ephemeral` for temporary responses
- Call `interaction.deferReply()` first for long-running operations
- Use `EmbedBuilder` for rich responses
- Create logger with `logger.child({ name: 'commands/xxx' })`

---

## `src/events/` - Adding Events

### Template

```typescript
import { Events } from 'discord.js';
import type { Event } from '@/types';

export const event: Event<Events.EventName> = {
  name: Events.EventName,
  runOnce: false,  // true = client.once(), false = client.on()
  execute: async (...args) => {
    // Event handling
  }
};
```

### Existing Events
- `ready.ts`: Bot ready. Generates invite link (dev only)
- `interaction-create.ts`: Interaction received. Command routing

### Best Practices
- **Always export as `event`**
- Use `runOnce: true` for one-time events
- Create logger with `logger.child({ name: 'events/xxx' })`

---

## `src/utils/` - Utilities

### `core.ts`
**Dynamic module loader**.
- `getCommands()`: Loads `.ts` files from `src/commands/`
- `getEvents()`: Loads `.ts` files from `src/events/`
- Also includes `index.ts` in subdirectories

### `logger.ts`
**Pino logger configuration**.
```typescript
import { logger } from '@/utils/logger';
const log = logger.child({ name: 'module-name' });
log.info('message');
log.error({ err: error }, 'error message');
```

### `error-handler.ts`
**Global error handling**.
- `unhandledRejection`: Unhandled Promise errors
- `uncaughtException`: Uncaught exceptions (exits process)
- `SIGINT/SIGTERM`: Graceful shutdown

### `dev-shortcuts.ts`
**Dev-only keyboard shortcuts**. No-op outside a TTY (Docker/Railway).
- `d`: sync commands to the guild, `r`: restart (watch mode only), `i`: print invite link, Ctrl+L: clear logs, `q` / Ctrl+C: quit

### `term.ts`
**Virtual terminal for dev**. Buffers log lines, pins the shortcut bar to the last row (scroll region), and repaints from the buffer on resize. Logs reach it via `logger.ts` (TTY only).

---

## Path Aliases

`@/` → maps to `src/` (configured in `tsconfig.json`)

```typescript
// Good
import { env } from '@/env';
import type { Command } from '@/types';

// Bad
import { env } from '../env';
```

---

## Coding Conventions

### Biome Config (`biome.jsonc`)
- Indent: 2 spaces
- Quotes: single quotes
- Trailing commas: none
- `const` preferred, `forEach` allowed

### Type Safety
- `strict: true` enabled
- `noUncheckedIndexedAccess: true`: Must handle undefined for array access
- Non-null assertion (`!`) triggers warning

---

## Development Workflow

### Commands

| Command | Description |
|---------|-------------|
| `bun run start` | Start bot |
| `bun run dev` | Start bot in watch mode (`d` = sync, `r` = restart, `i` = invite, `q` = quit) |
| `bun run deploy-commands` | Deploy commands to guild |
| `bun run deploy-commands --global` | Global deploy |
| `bun run check` | Biome lint + format |
| `bun run typecheck` | TypeScript check |

### Pre-commit Hook
`lefthook` runs `bun run check` automatically before commit.

### CI/CD
- GitHub Actions runs on push/PR to `main`
- Biome check + TypeScript check

---

## Deployment

### Railway
- `railway.json` pre-configured
- Environment variables: `DISCORD_BOT_TOKEN`, `DISCORD_APPLICATION_ID`

### Docker
```bash
docker build -t discord-bot .
docker run -d --env-file .env discord-bot
```
Multi-stage build, non-root user, production environment configured.

---

## Extension Guidelines

### Adding New Intents
Edit `src/client.ts`:
```typescript
intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,  // Privileged Intent - requires Discord Developer Portal config
]
```

### Adding New Environment Variables
1. Add Zod schema to `src/env.ts`
2. Add to `.env.example`
3. Add dummy values to CI/CD (if needed)

### Adding Subcommands
Define in `src/commands/parent/index.ts`:
```typescript
data: new SlashCommandBuilder()
  .setName('parent')
  .addSubcommand((sub) => 
    sub.setName('child').setDescription('...')
  )
```

---

## Common Use Cases

### 1. Add a New Slash Command
1. Create `src/commands/newcmd.ts`
2. Export with `Command<ChatInputCommandInteraction>` type
3. Run `bun run deploy-commands` to deploy

### 2. Execute Logic on Member Join
1. Create `src/events/member-join.ts`
2. Use `Events.GuildMemberAdd`
3. Add `GuildMembers` Intent to `client.ts`

### 3. Add a Database
1. Add ORM (Drizzle/Prisma)
2. Create `src/db/` directory
3. Add `DATABASE_URL` to environment variables
