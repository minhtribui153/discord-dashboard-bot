import 'dotenv/config';
import "reflect-metadata";
import { registerCommands, registerEvents } from './utils/registry';
import DiscordClient from './client/client';
import { Collection, GuildBan, Intents } from 'discord.js';
import { createConnection, getRepository } from "typeorm";
import { io } from 'socket.io-client';
import { entities } from "./typeorm";
import { GuildConfiguration } from "./typeorm/entities/GuildConfiguration";
import { checkForGuildConfigs } from './functions';

const client = new DiscordClient({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS ] });

(async () => {
  // Connect to MySQL Database
  await createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "tribui",
    password: "Tri2107@",
    database: "nocli",
    synchronize: true,
    socketPath: "/tmp/mysql.sock",
    entities
  });

  // Initialize Configuration Repository
  const configRepo = getRepository(GuildConfiguration);
  // Initialize WebSocket Server
  const socket = io(process.env.SERVER_URL || "");
  socket.emit('connection');
  socket.on('guildConfigUpdate', (config: GuildConfiguration) => {
    client.configs.set(config.guildId, config);
  });


  // Guild Configuration
  const guildConfigs = await configRepo.find();
  const configs = new Collection<string, GuildConfiguration>();
  guildConfigs.forEach(config => configs.set(config.guildId, config));

  client.configs = configs;

  checkForGuildConfigs(client, configs, configRepo);

  // Registration
  await registerCommands(client, '../commands');
  await registerEvents(client, '../events');
  await client.login(process.env.BOT_TOKEN);
})();

