require("dotenv").config({ quiet: true });

const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildMembers,
  ],
});

// Exported before anything else is required so modules that lazily
// require("./bot") (logger, distube) get the client.
module.exports.client = client;

client.commands = new Collection();
client.snipes = new Collection();

require("./db");
require("./distube");
const loadEvents = require("./functions/handleEvents");
const loadCommands = require("./functions/handleCommands");

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

loadEvents(client, path.join(__dirname, "events"));
loadCommands(client, path.join(__dirname, "commands"));
client.login(process.env.TOKEN);
