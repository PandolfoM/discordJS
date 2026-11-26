const fs = require("node:fs");
const path = require("node:path");

module.exports = (client, eventsDir) => {
  const files = fs
    .readdirSync(eventsDir)
    .filter((file) => file.endsWith(".js"));

  for (const file of files) {
    const event = require(path.join(eventsDir, file));
    const handler = async (...args) => {
      try {
        await event.execute(...args, client);
      } catch (error) {
        console.error(`Error in "${event.name}" handler (${file}):`, error);
      }
    };

    if (event.once) {
      client.once(event.name, handler);
    } else {
      client.on(event.name, handler);
    }
  }
};
