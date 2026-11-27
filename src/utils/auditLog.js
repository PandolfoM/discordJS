const { escapeMarkdown } = require("discord.js");
const { allLogChannelIds, logChannelId } = require("../config/channels");
const logger = require("./logger");

const MAX_FIELD = 1024;

/**
 * User-written text as plain text for an embed field: markdown and masked
 * links are escaped, and it's cut to fit.
 */
function plainText(text, empty = "*(no text)*") {
  if (!text) {
    return empty;
  }
  const escaped = escapeMarkdown(text).replace(/[[\]]/g, (b) => `\\${b}`);
  return escaped.length > MAX_FIELD
    ? `${escaped.slice(0, MAX_FIELD - 1)}…`
    : escaped;
}

/**
 * Only log the server the log channel belongs to (GUILDID), so activity from
 * any other server the bot is in never shows up there.
 */
const isLoggedGuild = (guildId) =>
  Boolean(guildId) && guildId === process.env.GUILDID;

/**
 * Whether a message's channel should be logged. Skips the log and music
 * channels and any in AUDIT_IGNORE_CHANNEL_IDS (comma-separated, e.g. private
 * channels the log channel's viewers shouldn't read). An ignored category
 * covers its channels, and an ignored channel covers its threads. Fails
 * closed: a message whose channel isn't known is not logged.
 */
function isLoggedChannel(message) {
  const { channel } = message;
  if (!isLoggedGuild(message.guildId) || !channel) {
    return false;
  }
  const ignored = new Set(
    [
      ...allLogChannelIds(),
      process.env.MUSIC_CHANNEL_ID,
      ...(process.env.AUDIT_IGNORE_CHANNEL_IDS ?? "").split(","),
    ]
      .map((id) => id?.trim())
      .filter(Boolean),
  );
  // The channel, its parent (a thread's channel, or a channel's category) and
  // that parent's category.
  const ancestors = [
    message.channelId,
    channel.parentId,
    channel.parent?.parentId,
  ];
  return !ancestors.some((id) => id && ignored.has(id));
}

/** Posts an embed to the channel for a log type (see /logs). Never throws. */
async function auditLog(client, type, embed) {
  try {
    const channelId = logChannelId(type);
    const channel =
      client.channels.cache.get(channelId) ??
      (await client.channels.fetch(channelId));
    await channel.send({
      embeds: [embed.setTimestamp()],
      allowedMentions: { parse: [] },
    });
  } catch (error) {
    logger("Could not post to the audit log:", error);
  }
}

module.exports = { auditLog, isLoggedChannel, isLoggedGuild, plainText };
