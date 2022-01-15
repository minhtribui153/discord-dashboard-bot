import BaseEvent from '../../utils/structures/BaseEvent';
import { Guild, Message } from 'discord.js';
import DiscordClient from '../../client/client';

export default class MessageEvent extends BaseEvent {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot || !message) return;
    const config = client.configs.get(message.guildId!);
    if (!config) {
      return message.reply("No configuration set! Please kick and invite me again!");
    }
    if (message.content.startsWith(config?.prefix)) {
      const [cmdName, ...cmdArgs] = message.content
        .slice(client.prefix.length)
        .trim()
        .split(/\s+/);
      const command = client.commands.get(cmdName);
      if (command) {
        command.run(client, message, cmdArgs);
      }
    }
  }
}