const { ActivityType } = require("discord.js");
const webscrape = require("../functions/webscraper");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    const statusArr = [
      {
        type: ActivityType.Watching,
        content: "Epicans 🌭",
        status: "online",
      },
      {
        type: ActivityType.Playing,
        content: "Duel of the Fates 🎻",
        status: "online",
      },
      {
        type: ActivityType.Listening,
        content: "The Cantina Band",
        status: "online",
      },
      {
        type: ActivityType.Competing,
        content: "The Boonta Eve Classic",
        status: "online",
      },
    ];

    async function switchPresence() {
      const option = Math.floor(Math.random() * statusArr.length);

      try {
        await client.user.setPresence({
          activities: [
            {
              name: statusArr[option].content,
              type: statusArr[option].type,
            },
          ],
          status: statusArr[option].status,
        });
      } catch (error) {
        console.log(error);
      }
      setTimeout(switchPresence, 60 * 1000);
    }

    switchPresence();
    setInterval(webscrape, 1800 * 1000);
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
