/**
 * Pre-flight check without connecting to Discord: every command and event
 * loads and is well-formed, command definitions pass discord.js validation,
 * ffmpeg runs, and required .env values are set.
 *
 *   npm run check
 */
require("dotenv").config({ quiet: true });

const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const SRC = path.join(__dirname, "..", "src");
const REQUIRED_ENV = ["TOKEN", "CLIENTID", "GUILDID"];
const OPTIONAL_ENV = {
  OPENAI_KEY: "/chatgpt won't work",
  SPOTIFTYCLIENTID: "Spotify links may not work",
  SPOTIFTYCLIENTSECRET: "Spotify links may not work",
  MUSIC_CHANNEL_ID: "/play and music controls work in any channel",
  DJ_ROLE_ID: "anyone can control music",
};

const errors = [];
const warnings = [];
const jsFiles = (dir) =>
  fs.readdirSync(dir).filter((file) => file.endsWith(".js"));

function checkCommands() {
  const dir = path.join(SRC, "commands");
  const names = new Map();

  for (const folder of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue;
    for (const file of jsFiles(path.join(dir, folder.name))) {
      const label = `commands/${folder.name}/${file}`;
      try {
        const command = require(path.join(dir, folder.name, file));
        if (!command.data || typeof command.execute !== "function") {
          errors.push(`${label}: missing "data" or "execute"`);
          continue;
        }
        const { name } = command.data.toJSON(); // throws on invalid definitions
        if (names.has(name)) {
          errors.push(
            `${label}: /${name} is also defined in ${names.get(name)}`,
          );
        }
        names.set(name, label);
      } catch (error) {
        errors.push(`${label}: ${error.message.split("\n")[0]}`);
      }
    }
  }
  return names.size;
}

function checkEvents() {
  const dir = path.join(SRC, "events");
  let count = 0;
  for (const file of jsFiles(dir)) {
    try {
      const event = require(path.join(dir, file));
      if (!event.name || typeof event.execute !== "function") {
        errors.push(`events/${file}: missing "name" or "execute"`);
      } else {
        count++;
      }
    } catch (error) {
      errors.push(`events/${file}: ${error.message.split("\n")[0]}`);
    }
  }
  return count;
}

function checkEnvironment() {
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) errors.push(`.env: ${key} is not set`);
  }
  for (const [key, consequence] of Object.entries(OPTIONAL_ENV)) {
    if (!process.env[key]) {
      warnings.push(`.env: ${key} is not set (${consequence})`);
    }
  }

  // Same lookup as src/distube/index.js.
  const ffmpegPath = process.env.FFMPEG_PATH || require("ffmpeg-static");
  const source = process.env.FFMPEG_PATH ? "FFMPEG_PATH" : "ffmpeg-static";
  const result = ffmpegPath
    ? spawnSync(ffmpegPath, ["-version"], { timeout: 10000 })
    : { error: new Error("no binary for this platform") };
  if (result.error || result.status !== 0) {
    const reason =
      result.error?.message ??
      (result.signal ? `killed by ${result.signal}` : `exit ${result.status}`);
    errors.push(
      `ffmpeg (${source}: ${ffmpegPath}) doesn't run: ${reason}. ` +
        "Install ffmpeg and set FFMPEG_PATH in .env (e.g. /usr/bin/ffmpeg).",
    );
  }
}

const commandCount = checkCommands();
const eventCount = checkEvents();
checkEnvironment();

console.log(`Commands: ${commandCount} OK | Events: ${eventCount} OK`);
warnings.forEach((warning) => console.warn(`warning: ${warning}`));
errors.forEach((error) => console.error(`error: ${error}`));

if (errors.length) {
  console.error(`\nCheck failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log("Check passed.");
