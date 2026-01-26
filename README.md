# Bun + TypeScript Discord Bot Template

![intro](docs/images/intro.png)

[![Bun](https://img.shields.io/badge/runtime-Bun-f9f1e1?logo=bun)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Biome](https://img.shields.io/badge/code%20style-Biome-60a5fa)](https://biomejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A simple, type-safe Discord Bot template built with Bun + Biome + TypeScript.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/discord-bot-template?referralCode=DIAbPh&utm_medium=integration&utm_source=template&utm_campaign=generic)

## Features

- Fast runtime with Bun
- Full type safety with Zod environment variable validation
- Dynamic command/event loading
- Docker/Railway deployment ready

## Quick Start

### Installation

```bash
bun install
```

### Configuration

```bash
cp .env.example .env
```

Edit `.env`:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_APPLICATION_ID=your_application_id_here
DISCORD_GUILD_ID=your_guild_id_here  # optional
```

### Deploy Commands

```bash
bun run deploy-commands        # Guild deploy (development)
bun run deploy-commands --global  # Global deploy (production, take more time to propagate)
```

### Run

```bash
bun run start
```

## Project Structure

```
src/
├── index.ts          # Entry point
├── client.ts         # Discord client setup
├── env.ts            # Environment validation
├── types.d.ts        # Type definitions
├── deploy.ts         # Command deployment script
├── commands/         # Slash commands
│   ├── ping.ts
│   └── info.ts
├── events/           # Event handlers
│   ├── ready.ts
│   └── interaction-create.ts
└── utils/
    ├── core.ts       # Command/event loader
    └── logger.ts     # Logger configuration
```

## Adding Commands

Create a new file in `src/commands/`:

```typescript
import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '@/types';

export const command: Command<ChatInputCommandInteraction> = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Says hello!'),
  execute: async (interaction) => {
    await interaction.reply('Hello, World!');
  }
};
```

## Adding Events

Create a new file in `src/events/`:

```typescript
import { Events } from 'discord.js';
import type { Event } from '@/types';

export const event: Event<Events.GuildMemberAdd> = {
  name: Events.GuildMemberAdd,
  execute: async (member) => {
    console.log(`${member.user.tag} joined the server!`);
  }
};
```

## Deployment

### Railway

To deploy on Railway, simply connect the repository and set environment variables.

1. Create a project on [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Set environment variables:
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_APPLICATION_ID`
4. Automatic deployment

Or deploy via CLI:

```bash
railway up
```

### Docker

```bash
docker build -t discord-bot .
docker run -d --env-file .env discord-bot
```

## Scripts

| Command | Description |
| ------- | ----------- |
| `bun run start` | Start the bot |
| `bun run deploy-commands` | Deploy slash commands |
| `bun run lint` | Run Biome linter |
| `bun run fmt` | Format code with Biome |
| `bun run check` | Run lint + format |
| `bun run typecheck` | TypeScript type check |

## Contributing

Contributions are very welcome!

### Bug Reports & Feature Requests

Please use [GitHub Issues](https://github.com/caru-ini/discord-bot-template/issues) to report bugs or suggest features.

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run checks:
   ```bash
   bun run check      # lint + format
   bun run typecheck  # type check
   ```
5. Commit with [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. Push and open a Pull Request

### Development Setup

```bash
bun install
cp .env.example .env
# Edit .env with your bot credentials
bun run start
```

## License

[MIT](LICENSE)
