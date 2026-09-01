import { REST, Routes } from 'discord.js';
import { env } from '@/env';
import { getCommands } from '@/utils/core';
import { logger } from '@/utils/logger';

const log = logger.child({ name: 'deploy' });

const getRoute = (isGlobal: boolean) => {
  if (isGlobal) {
    return Routes.applicationCommands(env.DISCORD_APPLICATION_ID);
  }
  if (!env.DISCORD_GUILD_ID) {
    throw new Error(
      'DISCORD_GUILD_ID is required for guild deployment. Use --global for global deployment.'
    );
  }
  return Routes.applicationGuildCommands(
    env.DISCORD_APPLICATION_ID,
    env.DISCORD_GUILD_ID
  );
};

/**
 * Deploys slash commands to the guild, or globally with isGlobal
 */
export const deployCommands = async (isGlobal: boolean) => {
  const commands = await getCommands();
  const data = commands.map((command) => command.data.toJSON());
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_BOT_TOKEN);
  const route = getRoute(isGlobal);

  const before = (await rest.get(route)) as unknown[];
  const synced = (await rest.put(route, { body: data })) as unknown[];
  const delta = synced.length - before.length;

  return {
    commands: data,
    summary: `Synced ${synced.length} commands (${delta >= 0 ? '+' : ''}${delta})`
  };
};

if (import.meta.main) {
  const isGlobal = process.argv.includes('--global');
  try {
    const { commands, summary } = await deployCommands(isGlobal);
    for (const command of commands) {
      log.info({ description: command.description }, command.name);
    }
    log.info({ scope: isGlobal ? 'global' : env.DISCORD_GUILD_ID }, summary);
  } catch (error) {
    log.error({ err: error }, 'Failed to deploy commands');
    process.exitCode = 1;
  }
}
