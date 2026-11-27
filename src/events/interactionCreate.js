const { Events, MessageFlags } = require("discord.js");
const { errorEmbed } = require("../config/embeds");
const logger = require("../utils/logger");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) {
      return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      logger(`No command matching "${interaction.commandName}" was found.`);
      return;
    }

    if (interaction.isAutocomplete()) {
      try {
        await command.autocomplete?.(interaction);
      } catch (error) {
        logger(`Autocomplete error in /${interaction.commandName}:`, error);
      }
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      logger(`Error executing /${interaction.commandName}:`, error);
      const payload = { embeds: [errorEmbed], flags: MessageFlags.Ephemeral };
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload);
        } else {
          await interaction.reply(payload);
        }
      } catch (replyError) {
        logger("Failed to send error response:", replyError);
      }
    }
  },
};
