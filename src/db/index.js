const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const DB_PATH =
  process.env.DB_PATH ?? path.join(__dirname, "../../.data/epicans.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id      TEXT PRIMARY KEY,
    dev_channel   TEXT,
    music_channel TEXT,
    dj_role       TEXT
  );

  CREATE TABLE IF NOT EXISTS watched_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    TEXT    NOT NULL,
    url        TEXT    NOT NULL,
    name       TEXT    NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE (user_id, url)
  );

  CREATE INDEX IF NOT EXISTS watched_items_user_id ON watched_items (user_id);
`);

module.exports = db;
