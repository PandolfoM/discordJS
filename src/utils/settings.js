const fs = require("node:fs");
const path = require("node:path");

// .data/ is gitignored, so settings survive pulls and deploys.
const FILE = path.join(__dirname, "..", "..", ".data", "settings.json");

let settings;

/** Reads the settings file once; a missing or broken file means defaults. */
function load() {
  if (!settings) {
    try {
      settings = JSON.parse(fs.readFileSync(FILE, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(`Ignoring unreadable ${FILE}:`, error.message);
      }
      settings = {};
    }
  }
  return settings;
}

const getSetting = (key) => load()[key];

/** Saves a setting (undefined removes it). Writes a temp file, then renames. */
async function setSetting(key, value) {
  const next = { ...load() };
  if (value === undefined) {
    delete next[key];
  } else {
    next[key] = value;
  }
  await fs.promises.mkdir(path.dirname(FILE), { recursive: true });
  const temp = `${FILE}.tmp`;
  await fs.promises.writeFile(temp, `${JSON.stringify(next, null, 2)}\n`);
  await fs.promises.rename(temp, FILE);
  settings = next;
}

module.exports = { getSetting, setSetting };
