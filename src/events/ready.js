module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    const statusArr = [
      {
        type: "WATCHING",
        content: "Epicans 🌭",
        status: "online",
      },
      {
        type: "PLAYING",
        content: "Duel of the Fates 🎻",
        status: "online",
      },
      {
        type: "LISTENING",
        content: "The Cantina Band",
        status: "online",
      },
      {
        type: "COMPETING",
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
        console.error(error);
      }
    }

    setInterval(switchPresence, 60 * 1000);
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
