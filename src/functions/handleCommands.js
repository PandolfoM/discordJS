const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
require("dotenv").config();

module.exports = (client) => {
  client.handleCommands = async (commandFolders, path) => {
    client.commandArray = [];
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`${path}/${folder}`)
        .filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const command = require(`../commands/${folder}/${file}`);
        // Set a new item in the Collection
        // With the key as the command name and the value as the exported module
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
      }
    }
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

    (async () => {
      try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(
          Routes.applicationGuildCommands(
            process.env.CLIENTID,
            process.env.GUILDID
          ),
          {
            body: client.commandArray,
          }
        );

        console.log("Successfully reloaded application (/) commands.");
      } catch (error) {
        console.error(error);
      }
    })();
  };
};
