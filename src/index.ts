import { Collection } from 'discord.js';
import { client } from '@/client';
import { env } from '@/env';
import { getCommands, getEvents } from '@/utils/core';
import { setupDevShortcuts } from '@/utils/dev-shortcuts';
import { setupErrorHandlers } from '@/utils/error-handler';
import { logger } from '@/utils/logger';

setupErrorHandlers();

const log = logger.child({ name: 'index' });

client.commands = new Collection();

const commands = await getCommands();
for (const command of commands) {
  client.commands.set(command.data.name, command);
}
log.info(`Loaded ${commands.length} command(s).`);

const events = await getEvents();
for (const event of events) {
  if (event.runOnce) {
    client.once(event.name, event.execute);
  } else {
    client.on(event.name, event.execute);
  }
}

log.info(`Loaded ${events.length} event(s).`);

client.login(env.DISCORD_BOT_TOKEN);

setupDevShortcuts();
