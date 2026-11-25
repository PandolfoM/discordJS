const { ActivityType, Events } = require("discord.js");
const { startWebscraper } = require("../functions/webscraper");

const PRESENCE_INTERVAL_MS = 60 * 1000;
const PRESENCES = [
  { type: ActivityType.Watching, name: "Epicans 🌭" },
  { type: ActivityType.Playing, name: "Duel of the Fates 🎻" },
  { type: ActivityType.Listening, name: "The Cantina Band" },
  { type: ActivityType.Competing, name: "The Boonta Eve Classic" },
];

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    const setRandomPresence = () => {
      const activity = PRESENCES[Math.floor(Math.random() * PRESENCES.length)];
      client.user.setPresence({ activities: [activity], status: "online" });
    };
    setRandomPresence();
    setInterval(setRandomPresence, PRESENCE_INTERVAL_MS);

    startWebscraper(client);
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
