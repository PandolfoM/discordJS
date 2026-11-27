const { once } = require("node:events");
const { codeBlock, Events } = require("discord.js");

const LOG_CHANNEL_ID = "1176505370634637372";
const MAX_LENGTH = 1900;

const READY_TIMEOUT_MS = 60 * 1000;
const SECRET_ENV = [
  "TOKEN",
  "OPENAI_KEY",
  "SPOTIFTYCLIENTID",
  "SPOTIFTYCLIENTSECRET",
];

const format = (part) =>
  part instanceof Error ? (part.stack ?? part.message) : String(part);

// The channel is more visible than the console: drop secrets from .env and
// URL query strings (e.g. signed stream URLs) before posting.
function redact(text) {
  let result = text.replace(/(https?:\/\/[^\s?#"'`]+)[?#][^\s"'`]*/g, "$1?…");
  for (const key of SECRET_ENV) {
    const secret = process.env[key];
    if (secret && secret.length >= 8) {
      result = result.split(secret).join(`<${key}>`);
    }
  }
  return result;
}

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
    // Give up (console only) if login never finishes, so waits don't pile up.
    if (!client.isReady()) {
      await once(client, Events.ClientReady, {
        signal: AbortSignal.timeout(READY_TIMEOUT_MS),
      });
    }
    const channel =
      client.channels.cache.get(LOG_CHANNEL_ID) ??
      (await client.channels.fetch(LOG_CHANNEL_ID));
    const text = redact(parts.map(format).join(" "));
    await channel.send(codeBlock("js", text.slice(0, MAX_LENGTH)));
  } catch (error) {
    // Console only: logging this through logger() could loop.
    console.error(
      `Could not send to log channel ${LOG_CHANNEL_ID}:`,
      String(error?.message ?? error),
    );
  }
}

module.exports = logger;
