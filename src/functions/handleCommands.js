const fs = require("node:fs");
const path = require("node:path");
const { REST, Routes } = require("discord.js");
const logger = require("../utils/logger");

module.exports = async (client, commandsDir) => {
  const body = [];
  const folders = fs
    .readdirSync(commandsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  for (const folder of folders) {
    const folderPath = path.join(commandsDir, folder.name);
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of files) {
      const command = require(path.join(folderPath, file));
      if (!command.data || !command.execute) {
        console.warn(
          `Skipping ${folder.name}/${file}: missing data or execute`,
        );
        continue;
      }
      client.commands.set(command.data.name, command);
      body.push(command.data.toJSON());
    }
  }

  const rest = new REST().setToken(process.env.TOKEN);
  try {
    console.log(`Refreshing ${body.length} application (/) commands...`);
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENTID,
        process.env.GUILDID,
      ),
      { body },
    );
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    logger("Failed to register application commands:", error);
  }
};
