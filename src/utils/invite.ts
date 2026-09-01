import { type Client, OAuth2Scopes, PermissionFlagsBits } from 'discord.js';

/**
 * Generates an invite link with the scopes/permissions this template assumes
 */
export const generateInviteLink = (client: Client<true>) =>
  client.generateInvite({
    scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
    permissions: [PermissionFlagsBits.Administrator]
  });
