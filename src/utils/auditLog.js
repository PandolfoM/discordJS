const { escapeMarkdown } = require("discord.js");
const { LOG_CHANNEL_ID } = require("../config/channels");
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
 * channels the log channel's viewers shouldn't read). Threads follow their
 * parent channel.
 */
function isLoggedChannel(message) {
  if (!isLoggedGuild(message.guildId)) {
    return false;
  }
  const ignored = new Set(
    [
      LOG_CHANNEL_ID,
      process.env.MUSIC_CHANNEL_ID,
      ...(process.env.AUDIT_IGNORE_CHANNEL_IDS ?? "").split(","),
    ]
      .map((id) => id?.trim())
      .filter(Boolean),
  );
  const parentId = message.channel?.isThread?.()
    ? message.channel.parentId
    : null;
  return !ignored.has(message.channelId) && !ignored.has(parentId);
}

/** Posts an embed to the log channel. Never throws. */
async function auditLog(client, embed) {
  try {
    const channel =
      client.channels.cache.get(LOG_CHANNEL_ID) ??
      (await client.channels.fetch(LOG_CHANNEL_ID));
    await channel.send({
      embeds: [embed.setTimestamp()],
      allowedMentions: { parse: [] },
    });
  } catch (error) {
    logger("Could not post to the audit log:", error);
  }
}

module.exports = { auditLog, isLoggedChannel, isLoggedGuild, plainText };
