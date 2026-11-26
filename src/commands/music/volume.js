const { SlashCommandBuilder, InteractionContextType } = require("discord.js");
const colors = require("../../config/colors");
const { statusEmbed } = require("../../config/embeds");
const { ensureVoice } = require("../../utils/musicUtils");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Change the volume of the currently playing song (0-200)")
    .addIntegerOption((option) =>
      option
        .setName("volume")
        .setDescription("Volume percent")
        .setMinValue(0)
        .setMaxValue(200)
        .setRequired(true),
    )
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }

    const volume = interaction.options.getInteger("volume");
    voice.queue.setVolume(volume);
    await interaction.reply({
      embeds: [
        statusEmbed(
          colors.success,
          `✅ | The volume has been changed to: ${volume}%/200%`,
        ),
      ],
    });
  },
};
