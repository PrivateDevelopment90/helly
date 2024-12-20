import {
  APIGuildMember,
  APIMessage,
  APIMessageReference,
  MessageType,
} from 'discord-api-types/v10';
import { EmbedBuilder } from '../builders/Embed';
import type { Client } from '../client/Client';
import { Parsers } from '../utils/transformers/Parsers';
import { BaseStructure } from './BaseStructure';
import type { MessageOptions } from './Channel';
import { GuildMember } from './GuildMember';
import { MessageReaction } from './MessageReaction';

export type MessageData = Partial<Message>;

class Message extends BaseStructure {
  /** Raw message data */
  private data: APIMessage;

  constructor(client: Client, data: APIMessage) {
    super(client);
    this.data = data;
  }

  /** The author of the message */
  get author() {
    return (
      this.client.users.cache.get(this.data.author.id) ??
      this.client.users.updateOrSet(this.data.author.id, this.data.author)
    );
  }

  /** Application ID of the interaction (if any) */
  get applicationId() {
    return this.data.application_id;
  }

  /** Message content */
  get content() {
    return this.data.content || '';
  }

  /** Message components (e.g., buttons, select menus) */
  get components() {
    return this.data.components?.map(c => Parsers.messageComponents(c)) ?? [];
  }

  /** Message ID */
  get id() {
    return this.data.id;
  }

  /** Whether the message is pinned */
  get pinned() {
    return this.data.pinned ?? false;
  }

  /** Whether the message was sent as TTS */
  get tts() {
    return this.data.tts ?? false;
  }

  /** Message nonce */
  get nonce() {
    return this.data.nonce;
  }

  /** Array of embeds in the message */
  get embeds() {
    return this.data.embeds.map(e => new EmbedBuilder(e));
  }

  /** The guild this message belongs to */
  get guild() {
    return this.guildId
      ? this.client.guilds.cache.get(this.guildId) ?? this.channel?.guild
      : undefined;
  }

  /** The channel this message belongs to */
  get channel() {
    return this.channelId
      ? this.client.channels.cache.get(this.channelId)
      : undefined;
  }

  /** Jump-to message URL */
  get url() {
    return `https://discord.com/channels/${this.guildId ?? '@me'}/${this.channelId}/${this.id}`;
  }

  /** Message reference data */
  get messageReference() {
    return this.data.message_reference as APIMessageReference;
  }

  /** Whether the message is a system message */
  get system() {
    return ![
      MessageType.Default,
      MessageType.Reply,
      MessageType.ChatInputCommand,
      MessageType.ContextMenuCommand,
    ].includes(this.data.type);
  }

  /** Message type as a string */
  get type() {
    return MessageType[this.data.type];
  }

  /** Raw numeric message type */
  get rawType() {
    return this.data.type;
  }

  /** Message flags */
  get flags() {
    return Parsers.messageFlags(this.data.flags);
  }

  /** The guild member representation of the author */
  get member() {
    if (!this.guild) return undefined;

    const memberData = this.data.member ?? ({ user: this.data.author } as APIGuildMember);
    return (
      this.guild.members.cache.get(this.author.id) ??
      new GuildMember(this.client, memberData, this.guild)
    );
  }

  /** Channel ID of the message */
  get channelId() {
    return this.data.channel_id;
  }

  /** Guild ID of the message */
  get guildId() {
    return this.data.guild_id ?? this.channel?.guild?.id;
  }

  /** Webhook ID if sent via webhook */
  get webhookId() {
    return this.data.webhook_id;
  }

  /** Message mentions */
  get mentions() {
    return Parsers.messageMentions(this.data.mentions, this.client);
  }

  /**
   * Replies to the message
   * @param content The content or options for the reply
   */
  reply(content: MessageOptions | string) {
    const replyOptions = typeof content === 'string' ? { content } : content;

    replyOptions.messageReference = {
      messageId: this.id,
      channelId: this.channelId,
      guildId: this.guildId,
      failIfNotExists: this.client.options.failIfNotExists ?? false,
    };

    return this.channel?.send(replyOptions);
  }

  /**
   * Edits the message
   * @param content The new content or options for the edit
   */
  edit(content: MessageOptions | string) {
    const editOptions = typeof content === 'string' ? { content } : content;
    return this.client.api.editMessage(this.channelId, this.id, editOptions);
  }

  /**
   * Deletes the message
   * @param reason The reason for deletion
   */
  delete(reason?: string) {
    return this.client.api.deleteMessage(this.channelId, this.id, reason);
  }

  /**
   * Reacts to the message
   * @param emoji The emoji to react with
   */
  react(emoji: string) {
    return this.client.api.createReaction(this.channelId, this.id, emoji);
  }

  /**
   * Removes a specific reaction from the message
   * @param emoji The emoji to remove
   * @param userId The ID of the user whose reaction to remove (default: current user)
   */
  removeReaction(emoji: string, userId?: string) {
    return this.client.api.deleteReaction(
      this.channelId,
      this.id,
      emoji,
      userId ?? '@me'
    );
  }

  /**
   * Fetches the reactions for a specific emoji
   * @param emoji The emoji to fetch reactions for
   */
  fetchReactions(emoji: string) {
    return this.client.api.fetchReactions(this.channelId, this.id, emoji);
  }

  /** Returns the message content as a string */
  override toString() {
    return this.content;
  }

  /** Updates the message data */
  private parseData(data: APIMessage) {
    if (!data) return;

    this.data = { ...this.data, ...data };
  }
}

export { Message };
