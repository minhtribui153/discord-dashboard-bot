import { Collection } from 'discord.js';
import { Repository } from 'typeorm';
import DiscordClient from '../client/client';
import { GuildConfiguration } from '../typeorm/entities/GuildConfiguration';

export async function checkForGuildConfigs(client: DiscordClient, configs: Collection<string, GuildConfiguration>, repository: Repository<GuildConfiguration>) {
    const guilds = client.guilds.cache;

    guilds.forEach(async guild => {
        if (!configs.has(guild.id)) {
            console.log('█ Adding Guild Configuration for ' + guild.name + ' █');
            const config = repository.create({ guildId: guild.id });
            await repository.save(config);
            client.configs.set(guild.id, config);
        }
    });
}