const { MessageFlags } = require("discord.js");
const colors = require("../config/colors");
const { errorEmbed, statusEmbed } = require("../config/embeds");
const { setGuildSetting } = require("../db/guildSettings");
const logger = require("./logger");

/** Persists one guild setting (null clears it) and replies with the result. */
async function updateGuildSetting(interaction, key, value, successMessage) {
  try {
    setGuildSetting(interaction.guildId, key, value);
  } catch (error) {
    logger(error);
    return interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
  }

  await interaction.reply({
    embeds: [statusEmbed(colors.success, successMessage)],
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = { updateGuildSetting };
