const { once } = require("node:events");
const { codeBlock, Events } = require("discord.js");

const LOG_CHANNEL_ID = "1176505370634637372";
const MAX_LENGTH = 1900;

const format = (part) =>
  part instanceof Error ? (part.stack ?? part.message) : String(part);

/**
 * Logs to the console and mirrors the message to the bot's log channel.
 * Takes the same arguments as console.error, e.g. logger("Play error:", error).
 */
async function logger(...parts) {
  console.error(...parts);
  try {
    // Lazy require avoids a circular import with bot.js at load time.
    const { client } = require("../bot");
    // Errors can happen before login finishes (e.g. registering commands).
    if (!client.isReady()) {
      await once(client, Events.ClientReady);
    }
    const channel =
      client.channels.cache.get(LOG_CHANNEL_ID) ??
      (await client.channels.fetch(LOG_CHANNEL_ID));
    const text = parts.map(format).join(" ");
    await channel.send(codeBlock("js", text.slice(0, MAX_LENGTH)));
  } catch (error) {
    // Console only: logging this through logger() could loop.
    console.error(
      `Could not send to log channel ${LOG_CHANNEL_ID}:`,
      error.message,
    );
  }
}

module.exports = logger;
