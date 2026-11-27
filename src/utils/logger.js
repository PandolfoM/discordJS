const { once } = require("node:events");
const { codeBlock, Events } = require("discord.js");

const { LOG_CHANNEL_ID } = require("../config/channels");
const MAX_LENGTH = 1900;

const READY_TIMEOUT_MS = 60 * 1000;
const SECRET_KEY = /TOKEN|SECRET|KEY|PASS|CLIENTID/i;
const DISCORD_TOKEN = /[\w-]{24,}\.[\w-]{6}\.[\w-]{27,}/g;
const AUTH_HEADER = /\b(Bearer|Basic|Bot)\s+[\w.~+/=-]{8,}/gi;
// Keep only scheme + host: signed URLs can carry credentials in the userinfo,
// path or query.
const URL_PATTERN = /(https?:\/\/)(?:[^@\s/]*@)?([^\s/?#"'`]+)[^\s"'`]*/g;

const format = (part) =>
  part instanceof Error ? (part.stack ?? part.message) : String(part);

// .env values whose names look secret, read at call time so it covers new keys.
const secrets = () =>
  Object.entries(process.env).filter(
    ([key, value]) => SECRET_KEY.test(key) && value?.length >= 8,
  );

// The channel is more visible than the console, so strip secrets, auth
// headers, token-shaped strings and URL details before posting.
function redact(text) {
  let result = text;
  for (const [key, value] of secrets()) {
    for (const form of [value, encodeURIComponent(value)]) {
      result = result.split(form).join(`<${key}>`);
    }
  }
  return result
    .replace(URL_PATTERN, "$1$2/…")
    .replace(AUTH_HEADER, "$1 <redacted>")
    .replace(DISCORD_TOKEN, "<token>");
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
