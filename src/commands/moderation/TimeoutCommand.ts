import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { getRepository, Repository } from 'typeorm';
import { ModerationLog } from '../../typeorm/entities/ModerationLog';
import { io } from 'socket.io-client';

export default class KickCommand extends BaseCommand {
  constructor(private readonly modLogRepository: Repository<ModerationLog> = getRepository(ModerationLog)) {
    super('timeout', 'moderation', 'Timeouts a user from a server', []);
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const [memberId, time, ...reason] = args;
    if (!memberId) {
      message.reply('❌ You must provide a member ID!')
      return;
    };
    const duration = parseInt(time);

    if (isNaN(duration)) {
        message.reply('❌ You must provide a valid time!')
        return;
    }

    try {
      const member = await message.guild?.members.fetch(memberId)!;
      await member.timeout(duration * 1000, reason.join(' '));
      message.reply(`✅ <@${memberId}> received a timeout!\n> Reason: ${reason.join(' ') !== '' ? reason.join(' ') : 'No reason provided'}`);
      const modLog = this.modLogRepository.create({
        guildId: message.guildId!,
        memberId: memberId,
        issuedBy: message.author.id,
        reason: reason.join(' ') !== '' ? reason.join(' ') : 'No reason provided',
        issuedOn: new Date(),
        type: "timeout"
      });
      await this.modLogRepository.save(modLog);
      const socket = io(process.env.SERVER_URL || "");
      socket.emit('chartUpdate');
    } catch (error) {
      console.log(error);
    }
  }
}