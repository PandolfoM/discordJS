const { Events, MessageFlags } = require("discord.js");
const { errorEmbed } = require("../config/embeds");
const logger = require("../utils/logger");
const { handleMusicButton, isMusicButton } = require("../utils/musicButtons");

/** Runs a handler, logging errors and telling the user something went wrong. */
async function run(interaction, label, handler) {
  try {
    await handler();
  } catch (error) {
    logger(`Error executing ${label}:`, error);
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
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (isMusicButton(interaction)) {
      return run(interaction, `button ${interaction.customId}`, () =>
        handleMusicButton(interaction, client),
      );
    }

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

    return run(interaction, `/${interaction.commandName}`, () =>
      command.execute(interaction, client),
    );
  },
};
