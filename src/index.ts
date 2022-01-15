import "dotenv/config";
import "reflect-metadata";
import { registerCommands, registerEvents } from './utils/registry';
import DiscordClient from './client/client';
import { Collection, Intents } from 'discord.js';
import { createConnection, getRepository } from "typeorm";
import { GuildConfiguration } from "./typeorm/entities/GuildConfiguration";
const client = new DiscordClient({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS ] });

(async () => {
  await createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "tribui",
    password: "Tri2107@",
    database: "nocli",
    synchronize: true,
    socketPath: "/tmp/mysql.sock",
    entities: [
      GuildConfiguration,
    ]
  })
  //client.prefix = config.prefix || client.prefix;
  const configRepo = getRepository(GuildConfiguration);
  const guildConfigs = await configRepo.find();
  const configs = new Collection<string, GuildConfiguration>();
  guildConfigs.forEach(config => configs.set(config.guildId, config));
  client.configs = configs;
  await registerCommands(client, '../commands');
  await registerEvents(client, '../events');
  await client.login(process.env.BOT_TOKEN);
})();

