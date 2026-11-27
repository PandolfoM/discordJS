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

/** Channels whose activity isn't worth logging. */
const isIgnoredChannel = (channelId) =>
  channelId === LOG_CHANNEL_ID || channelId === process.env.MUSIC_CHANNEL_ID;

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

module.exports = { auditLog, isIgnoredChannel, plainText };
