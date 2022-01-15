import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { getRepository } from "typeorm";
import { GuildConfiguration } from '../../typeorm/entities/GuildConfiguration';

export default class PrefixCommand extends BaseCommand {
  constructor(
    private readonly guildConfigRepository = getRepository(GuildConfiguration)
  ) {
    super('prefix', 'moderation', 'changes prefix', []);
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (!args.length) {
      message.reply('❌ You must provide a prefix');
      return;
    }
    const [newPrefix] = args;
    try {
      const config = client.configs.get(message.guildId!);
      const updatedConfig = await this.guildConfigRepository.save({
        ...config,
        prefix: newPrefix,
      });
      message.reply(`✅ Prefix set to \`${newPrefix}\``);
      client.configs.set(message.guildId!, updatedConfig);
    } catch (error) {
      message.reply('❌ An error occured while updating the prefix'); 
    }
  }
}