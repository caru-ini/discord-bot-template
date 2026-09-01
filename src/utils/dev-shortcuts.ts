import fs from 'node:fs';
import { client } from '@/client';
import { deployCommands } from '@/deploy';
import { env } from '@/env';
import { generateInviteLink } from './invite';
import { logger } from './logger';
import { clearTerm, setupTerm } from './term';

const log = logger.child({ name: 'dev-shortcuts' });

const keycap = (k: string) => `\x1b[7m ${k} \x1b[27m`;
const BAR = `${keycap('d')} sync   ${keycap('r')} restart   ${keycap('i')} invite   ${keycap('q')} quit`;

/**
 * Dev-only keyboard shortcuts with a bar pinned to the terminal's last row.
 * No-op outside a TTY (Docker/Railway).
 */
export const setupDevShortcuts = () => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return;
  }

  if (!env.DISCORD_GUILD_ID) {
    log.warn(
      'DISCORD_GUILD_ID is not set; "d" (guild deploy) will fail. Set it in .env.'
    );
  }

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', async (key) => {
    const input = key.toString();
    if (input === 'd') {
      if (!env.DISCORD_GUILD_ID) {
        log.warn('DISCORD_GUILD_ID is not set. Skipping guild deploy.');
        return;
      }
      try {
        const { summary } = await deployCommands(false);
        log.info(summary);
      } catch (error) {
        log.error({ err: error }, 'Failed to deploy commands');
      }
    } else if (input === 'r') {
      const entry = process.argv[1];
      if (entry) {
        log.info('Restarting...');
        // bun --watch reloads on write events, not mtime
        fs.writeFileSync(entry, fs.readFileSync(entry));
      }
    } else if (input === 'i') {
      if (client.isReady()) {
        log.info({ inviteLink: generateInviteLink(client) }, 'Invite Link');
      } else {
        log.warn('Client is not ready yet.');
      }
    } else if (input === '\x0c') {
      clearTerm();
    } else if (input === 'q' || input === '\x03') {
      // Raw mode swallows Ctrl+C (\x03), so forward SIGINT ourselves
      process.stdin.setRawMode(false);
      process.kill(process.pid, 'SIGINT');
    }
  });

  setupTerm(BAR);
};
