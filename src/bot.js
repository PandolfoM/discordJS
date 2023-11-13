const { Client, Collection } = require("discord.js");
const fs = require("fs");
const client = new Client({ intents: 32767 });

module.exports.client = client;

client.commands = new Collection();
client.snipes = new Collection();

require("dotenv").config();

const functions = fs
  .readdirSync("./src/functions")
  .filter((file) => file.endsWith(".js"));
const eventFiles = fs
  .readdirSync("./src/events")
  .filter((file) => file.endsWith(".js"));
const commandsFolders = fs.readdirSync("./src/commands");

(async () => {
  for (file of functions) {
    require(`./functions/${file}`)(client);
  }
  client.handleEvents(eventFiles, "./src/events");
  client.handleCommands(commandsFolders, "./src/commands");
  client.login(process.env.TOKEN);
})();
