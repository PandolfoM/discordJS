const db = require("./index");

/** Setting key -> column. Also acts as the whitelist for dynamic SQL below. */
const COLUMNS = {
  devChannel: "dev_channel",
  musicChannel: "music_channel",
  djRole: "dj_role",
};

const EMPTY = Object.freeze({ devChannel: null, musicChannel: null, djRole: null });

const selectSettings = db.prepare(`
  SELECT dev_channel AS devChannel, music_channel AS musicChannel, dj_role AS djRole
  FROM guild_settings WHERE guild_id = ?
`);

const upserts = Object.fromEntries(
  Object.entries(COLUMNS).map(([key, column]) => [
    key,
    db.prepare(`
      INSERT INTO guild_settings (guild_id, ${column}) VALUES (?, ?)
      ON CONFLICT (guild_id) DO UPDATE SET ${column} = excluded.${column}
    `),
  ]),
);

/** Settings for a guild; unset values are null. */
function getGuildSettings(guildId) {
  return selectSettings.get(guildId) ?? EMPTY;
}

/** Sets one setting (`value` null clears it). */
function setGuildSetting(guildId, key, value) {
  const statement = upserts[key];
  if (!statement) {
    throw new Error(`Unknown guild setting: ${key}`);
  }
  statement.run(guildId, value);
}

module.exports = { getGuildSettings, setGuildSetting };
