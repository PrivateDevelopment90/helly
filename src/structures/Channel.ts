/**
 * Represents a message to be sent to the API.
 * @typedef {Object} MessagePayload
 * @property {string} [content] - The message content
 */
import type { Client } from '../client/Client';
import { ChannelType, RawChannelTypes } from '../constants/channelTypes';
import { Snowflake } from '../utils/Snowflake';
import { DataManager } from './DataManager';
import type { Guild } from './Guild';
import type { MessageEmbed, RawMessageEmbed } from './MessageEmbed';

export interface MessagePayload {
	content?: string;
	embeds?: (MessageEmbed | RawMessageEmbed)[];
}
export type MessageOptions = string | MessagePayload;

/**
 * Represents an unknown channel on Discord.
 * @hideconstructor
 */
class Channel extends DataManager {
	createdTimestamp!: number;
	createdAt!: Date;
	id!: string;
	name!: string;
	guild?: Guild;

	type!: ChannelType;
	constructor(client: Client, data: any, guild?: Guild) {
		super(client);
		this.guild = guild;
		this.parseData(data);
	}

	/**
	 * Deletes the channel.
	 * @param {string} reason - The reason for deleting this channel
	 * @example
	 * channel.delete('I want to delete this channel');
	 * @returns {Promise<Channel>}
	 */
	async delete(reason?: string) {
		const data = await this.client.requester.make(`channels/${this.id}`, 'DELETE', '', { 'X-Audit-Log-Reason': reason });
		return new Channel(this.client, data, this.guild);
	}

	/**
	 * Indicates whether this channel is a {@link TextChannel}
	 * @returns {boolean}
	 */
	isText() {
		return this.type === 'GUILD_TEXT';
	}

	/**
	 * Indicates whether this channel is an unknown type channel
	 * @returns {boolean}
	 */
	isUnknown() {
		return this.type === 'UNKNOWN';
	}

	/**
	 * When concatenated with a string, this automatically returns the channel's mention instead of the Channel object.
	 * @returns {string}
	 */
	override toString() {
		return `<#${this.id}>`;
	}

	override parseData(data: any) {
		if (typeof data === 'undefined') return null;

		if ('id' in data) {
			/**
			 * The channel's id
			 * @type {string}
			 */
			this.id = data.id;
		}

		/**
		 * The timestamp the user was created at
		 * @type {number}
		 */
		this.createdTimestamp = Snowflake.deconstruct(this.id);
		/**
		 * The time the user was created at
		 * @type {Date}
		 */
		this.createdAt = new Date(this.createdTimestamp);

		if ('name' in data) {
			/**
			 * The channel's name
			 * @type {string}
			 */
			this.name = data.name;
		}

		/**
		 * The type of the channel
		 * @type {ChannelType}
		 */
		this.type = RawChannelTypes[data.type] ?? 'UNKNOWN';
	}
}

export { Channel };
