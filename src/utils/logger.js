const { codeBlock } = require("discord.js");

const LOG_CHANNEL_ID = "1176505370634637372";
const MAX_LENGTH = 1900;

/** Logs to the console and mirrors the message to the bot's log channel. */
async function logger(message) {
  console.error(message);
  try {
    // Lazy require avoids a circular import with bot.js at load time.
    const { client } = require("../bot");
    const channel =
      client.channels.cache.get(LOG_CHANNEL_ID) ??
      (await client.channels.fetch(LOG_CHANNEL_ID));
    const text =
      message instanceof Error
        ? (message.stack ?? message.message)
        : String(message);
    await channel.send(codeBlock("js", text.slice(0, MAX_LENGTH)));
  } catch {
    console.error("Could not send message to log channel");
  }
}

module.exports = logger;
