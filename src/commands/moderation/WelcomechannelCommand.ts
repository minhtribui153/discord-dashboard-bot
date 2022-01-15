import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { GuildConfiguration } from '../../typeorm/entities/GuildConfiguration';
import { getRepository } from 'typeorm';

export default class WelcomechannelCommand extends BaseCommand {
  constructor(
    private readonly guildConfigRepository = getRepository(GuildConfiguration)
  ) {
    super('welcomechannel', 'moderation', 'Sets the welcome channel', []);
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (!args.length) {
      message.reply('❌ Please provide a channel ID');
      return;
    }
    const [newChannelId] = args;
    try {
      const config = client.configs.get(message.guildId!);
      const updatedConfig = await this.guildConfigRepository.save({
        ...config,
        welcomeChannelId: newChannelId,
      });
      message.reply(`✅ Welcome Channel set to <#${newChannelId}>`);
      client.configs.set(message.guildId!, updatedConfig);
    } catch (error) {
      message.reply('❌ An error occured while updating the Welcome Channel'); 
    }
  }
}