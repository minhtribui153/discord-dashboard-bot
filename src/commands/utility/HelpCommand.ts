import { Base, Collection, Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { Category } from '../../types';

const category = {
  moderation: {
      name: 'Moderation',
      emoji: "🛠️",
  },
  testing: {
      name: 'Testing',
      emoji: "🧪",
  },
  utility: {
      name: 'Utility',
      emoji: "⚙️",
  }
} as {
  [key: string]: {
      name: string;
      emoji: string;
  }
}

export default class HelpCommand extends BaseCommand {
  constructor() {
    super('help', 'utility', 'Opens help panel', []);
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const categories: {
      [key: string]: {
          amount: number
          emoji: string
      }
    } = {};

    client.commands.forEach(command => {
      if (categories[category[command.getCategory()].name]) {
        ++categories[category[command.getCategory()].name].amount
      } else {
        categories[category[command.getCategory()].name] = {
          amount: 1,
          emoji: category[command.getCategory()].emoji,
        }
      }
    });

    const categories2: Category[] = [];
            
    const keys = Object.keys(categories);
            
    for (const key of keys) {
      categories2.push({
        label: key,
        amount: categories[key].amount,
        emoji: categories[key].emoji,
      });
    }

    const embed = new MessageEmbed()
            .setTitle('Help Panel')
            .setDescription('Please select a category in the Dropdown menu')
            .setColor('DARK_RED');
        
        const components = (state: boolean, buttonState: boolean) => new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                .setCustomId('help_menu')
                .setPlaceholder('Please select a command category')
                .setDisabled(state)
                .addOptions(
                    categories2.map((category) => {
                        return {
                            label: `${category.label} - ${category.amount} command${category.amount === 1 ? "" : "s"}`,
                            value: category.label,
                            description: `Commands from ${category.label} category`,
                            emoji: category.emoji,
                        }
                    })
                ),
            );
        const buttonComponent = (state: boolean) => new MessageActionRow()
            .addComponents(
                    new MessageButton()
                    .setCustomId('help_exit')
                    .setLabel('End Interaction')
                    .setDisabled(state)
                    .setStyle("DANGER")
                    .setEmoji('<:red_cross_mark:921691762433613824>')
            )

        const filter = (interaction: any) => interaction.user.id === message.member?.id;

        const msg = message;
        
        let hasActivity = false;

        const initialMsg = msg.reply({
            embeds: [embed],
            components: [components(false, true), buttonComponent(true)],
        }) as any;
        const collector = msg.channel?.createMessageComponentCollector({ filter });

        let counter = 0;
        const maxLimitInactivity = 10;
        const checkForInactivity = () => {
            if (hasActivity === true) return;
            if (counter === maxLimitInactivity) {
                hasActivity = false;
                collector.emit('end');
                return
            }
            counter += 1;
            setTimeout(checkForInactivity, 1000);
        }

        await checkForInactivity();

        collector.on("collect", (interaction) => {
            counter = 0;
            if (interaction.isButton()) {
                if (interaction.customId === "help_exit") {
                    hasActivity = true;
                    collector.emit('end');
                    const EndEmbed = new MessageEmbed()
                        .setTitle(`Help Panel - Session Expired`)
                        .setDescription(`❌ The session for this command has expired because you ended the interaction!`)
                        .setColor('RED');
                    
                    interaction.update({ embeds: [EndEmbed], components: [components(true, true), buttonComponent(true)] });
                    
                    return;
                }
            }
            if (!interaction.isSelectMenu()) return;
            if (interaction.customId !== "help_menu") return;
            const values = interaction.values;
            const specifiedCategory = values[0].toLowerCase();
            const categoryEmbed = new MessageEmbed()
            .setTitle(`Help Panel - ${values[0]} Category`)
            .setDescription(`Here are the commands from ${values[0].toLowerCase()} category`)
            .setColor('RANDOM');
            
            client.commands.forEach(command => {
                if (command.getCategory() === specifiedCategory) {
                    let name = command.getName();
                    let description = command.getDescription() !== "" ? command.getDescription() : "Description Not Found";
                    categoryEmbed.addField(name, `└─ ${description}`);
                }

            });
            
            interaction.update({ embeds: [categoryEmbed], components: [components(false, false),  buttonComponent(false)] });
            return;
        });
        collector.on("end", () => {
            if (hasActivity) return;
            const EndEmbed = new MessageEmbed()
            .setTitle(`Help Panel - Session Expired`)
            .setDescription(`❌ The session for this command has expired due to timeout!`)
            .setColor('RED');
            initialMsg.edit({ embeds: [embed], components: [components(true, true)] });
        })
  }
}