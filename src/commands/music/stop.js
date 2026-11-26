const { SlashCommandBuilder, InteractionContextType } = require("discord.js");
const colors = require("../../config/colors");
const { statusEmbed } = require("../../config/embeds");
const { ensureVoice } = require("../../utils/musicUtils");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playing music")
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }

    // DisTube waits for any song that's still loading, which can exceed 3s.
    await interaction.deferReply();
    await voice.queue.stop();
    client.distube.voices.leave(interaction.guildId);
    await interaction.editReply({
      embeds: [statusEmbed(colors.info, "🔇 | Stopped playing music!")],
    });
  },
};
