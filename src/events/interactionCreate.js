const { Events, MessageFlags } = require("discord.js");
const { errorEmbed } = require("../config/embeds");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) {
      return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.error(
        `No command matching "${interaction.commandName}" was found.`,
      );
      return;
    }

    if (interaction.isAutocomplete()) {
      try {
        await command.autocomplete?.(interaction);
      } catch (error) {
        console.error(
          `Autocomplete error in /${interaction.commandName}:`,
          error,
        );
      }
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`Error executing /${interaction.commandName}:`, error);
      const payload = { embeds: [errorEmbed], flags: MessageFlags.Ephemeral };
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload);
        } else {
          await interaction.reply(payload);
        }
      } catch (replyError) {
        console.error("Failed to send error response:", replyError);
      }
    }
  },
};
