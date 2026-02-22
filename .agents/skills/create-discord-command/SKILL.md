---
name: create-discord-command
description: Create and update Discord slash commands for this Bun + TypeScript + discord.js v14 template. Use when the request involves adding a new command, changing command options/subcommands, refactoring command behavior, or fixing command typing/execution in files under src/commands/.
---

# Create Discord Command

Create one command module that exports `command` and matches the repository type pattern.

## Workflow

1. Confirm requested command shape.
- Determine command name, description, options/subcommands, and response style (ephemeral/public).

2. Choose command file location.
- Use `src/commands/<name>.ts` for a simple command.
- Use `src/commands/<group>/index.ts` for grouped or complex command sets.
- For complex implementations, prefer barrel-file organization by default: create a dedicated subdirectory and place the command in `index.ts`.

3. Implement typed command module.
- Import command types from `discord.js` and `Command` from `@/types`.
- Export `command` exactly.
- Use `SlashCommandBuilder` for schema and `execute` for behavior.

4. Handle runtime behavior safely.
- Use `MessageFlags.Ephemeral` when response should be private.
- Call `interaction.deferReply()` before long operations.
- Wrap non-trivial logic with clear error paths if needed.

5. Validate and deploy.
- Run `bun run typecheck`.
- Run `bun run check`.
- Run `bun run deploy-commands` (or `bun run deploy-commands --global` when explicitly requested).

## Command Template

```typescript
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder
} from 'discord.js';
import type { Command } from '@/types';

export const command: Command<ChatInputCommandInteraction> = {
  data: new SlashCommandBuilder()
    .setName('command-name')
    .setDescription('Command description'),
  execute: async (interaction) => {
    await interaction.reply({
      content: 'Response',
      flags: MessageFlags.Ephemeral
    });
  }
};
```

## Constraints

- Use `@/` path aliases, not relative imports for internal modules.
- Keep strict typing; avoid non-null assertions unless required.
- Keep behavior aligned with `src/events/interaction-create.ts` command routing.
