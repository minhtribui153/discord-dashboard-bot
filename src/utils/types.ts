import { Interaction, Message } from "discord.js";
import DiscordClient from "../client/client";

export type ModerationActionType = 'ban' | 'kick' | 'timeout';

export type CommandCallback = {
    client: DiscordClient;
    message: Message;
    interaction: Interaction;
    args: Array<string> | null;
}