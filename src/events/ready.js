const { ActivityType, Events } = require("discord.js");
const { collection, onSnapshot } = require("firebase/firestore");
const db = require("../firebaseConfig");
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

    onSnapshot(
      collection(db, "settings"),
      (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type === "removed") {
            client.settings.delete(change.doc.id);
          } else {
            client.settings.set(change.doc.id, change.doc.data());
          }
        }
      },
      (error) => console.error("Settings listener error:", error),
    );

    startWebscraper(client);
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
