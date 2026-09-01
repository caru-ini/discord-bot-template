import { Events } from 'discord.js';
import type { Event } from '@/types';
import { generateInviteLink } from '@/utils/invite';
import { logger } from '@/utils/logger';

const log = logger.child({ name: 'events/ready' });

export const event: Event<Events.ClientReady> = {
  name: Events.ClientReady,
  runOnce: true,
  execute: async (client) => {
    log.info(`Bot ready! Logged in as ${client.user?.tag}`);
    process.env.NODE_ENV !== 'production' &&
      log.info(
        { inviteLink: generateInviteLink(client) },
        'Invite Link (Dev Only):'
      );
  }
};
