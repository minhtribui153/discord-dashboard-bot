import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "guild_configurations" })
export class GuildConfiguration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, name: "guild_id" })
    guildId: string;

    @Column({ default: "?", name: "prefix" })
    prefix: string;

    @Column({ name: "welcome_channel_id", nullable: true })
    welcomeChannelId: string;
};