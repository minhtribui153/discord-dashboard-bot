// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildMemberAdd
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import BaseEvent from '../utils/structures/BaseEvent';
import DiscordClient from '../client/client';

export default class GuildMemberAddEvent extends BaseEvent {
  constructor() {
    super('guildMemberAdd');
  }
  
  async run(client: DiscordClient, member: GuildMember) {
    const config = client.configs.get(member.guild.id);
    if (!config) return;
    if (config.welcomeChannelId) {
      const channel = member.guild.channels.cache.get(config.welcomeChannelId) as TextChannel;
      if (channel) {
        const embed = new MessageEmbed()
          .setTitle('New Member Joined')
          .setColor("GREEN")
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setDescription(`Welcome ${member.user.tag} to the server!`)
          .setTimestamp()
          .addFields([
            {
              name: 'Joined Server Since',
              value: `<t:${Math.floor((member?.joinedTimestamp!) / 1000)}:R>`,
            },
            {
              name: 'Account Created',
              value: `<t:${Math.floor((member?.user?.createdTimestamp!) / 1000)}:R>`,
            }
          ])
        channel.send({ embeds: [embed] });
      }
    }
  }
}