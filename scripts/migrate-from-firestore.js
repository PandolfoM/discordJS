/**
 * One-time copy of Firestore data (settings + webscraper) into the SQLite DB.
 * Uses the Firestore REST API with the old APIKEY/PROJECTID from .env, so the
 * firebase package isn't needed. Safe to re-run: rows are upserted.
 *
 *   npm run migrate:firestore -- --dry-run   # print what would be imported
 *   npm run migrate:firestore                # import
 */
require("dotenv").config({ quiet: true });

const DRY_RUN = process.argv.includes("--dry-run");
const { APIKEY, PROJECTID } = process.env;

if (!APIKEY || !PROJECTID) {
  console.error("APIKEY and PROJECTID must be set in .env to read Firestore.");
  process.exit(1);
}

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECTID}/databases/(default)/documents`;

/** Converts a Firestore REST typed value into plain JS. */
function decode(value) {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(decode);
  if ("mapValue" in value) return decodeFields(value.mapValue.fields);
  return undefined;
}

const decodeFields = (fields = {}) =>
  Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decode(value)]));

async function listCollection(name) {
  const docs = [];
  let pageToken;
  do {
    const url = new URL(`${BASE_URL}/${name}`);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, { headers: { "X-Goog-Api-Key": APIKEY } });
    if (!res.ok) {
      throw new Error(`Reading "${name}" failed: ${res.status} ${await res.text()}`);
    }
    const body = await res.json();
    for (const doc of body.documents ?? []) {
      docs.push({ id: doc.name.split("/").pop(), data: decodeFields(doc.fields) });
    }
    pageToken = body.nextPageToken;
  } while (pageToken);
  return docs;
}

// Firestore used "0" for "not set"; SQLite uses NULL.
const orNull = (value) => (value && value !== "0" ? String(value) : null);

(async () => {
  const settings = (await listCollection("settings")).map(({ id, data }) => ({
    guildId: id,
    devChannel: orNull(data.devChannel),
    musicChannel: orNull(data.musicChannel),
    djRole: orNull(data.djRole),
  }));

  const items = (await listCollection("webscraper")).flatMap(({ id, data }) =>
    (data.items ?? [])
      .filter((item) => item?.url)
      .map((item) => ({ userId: data.id ?? id, url: item.url, name: item.name || item.url })),
  );

  console.log(`Found ${settings.length} guild settings and ${items.length} watched items.`);
  if (DRY_RUN) {
    console.table(settings);
    console.table(items.map(({ userId, name }) => ({ userId, name: name.slice(0, 60) })));
    console.log("Dry run: nothing written.");
    return;
  }

  const db = require("../src/db");
  const upsertSettings = db.prepare(`
    INSERT INTO guild_settings (guild_id, dev_channel, music_channel, dj_role)
    VALUES (@guildId, @devChannel, @musicChannel, @djRole)
    ON CONFLICT (guild_id) DO UPDATE SET
      dev_channel = excluded.dev_channel,
      music_channel = excluded.music_channel,
      dj_role = excluded.dj_role
  `);
  const upsertItem = db.prepare(`
    INSERT INTO watched_items (user_id, url, name) VALUES (@userId, @url, @name)
    ON CONFLICT (user_id, url) DO UPDATE SET name = excluded.name
  `);

  db.transaction(() => {
    settings.forEach((row) => upsertSettings.run(row));
    items.forEach((row) => upsertItem.run(row));
  })();

  console.log(`Imported into ${db.name}.`);
  db.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
