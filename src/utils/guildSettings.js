const { MessageFlags } = require("discord.js");
const colors = require("../config/colors");
const { errorEmbed, statusEmbed } = require("../config/embeds");
const { setGuildSetting } = require("./firebaseUtils");
const logger = require("./logger");

/** Persists one guild setting and replies with the result. "0" means unset. */
async function updateGuildSetting(interaction, field, value, successMessage) {
  try {
    await setGuildSetting(interaction.guildId, field, value);
    await interaction.reply({
      embeds: [statusEmbed(colors.success, successMessage)],
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger(error);
    await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
  }
}

module.exports = { updateGuildSetting };
