const { SlashCommandBuilder, InteractionContextType } = require("discord.js");
const colors = require("../../config/colors");
const { statusEmbed } = require("../../config/embeds");
const { ensureVoice } = require("../../utils/musicUtils");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip track")
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }
    const { queue } = voice;

    if (queue.songs.length <= 1 && !queue.autoplay) {
      await queue.stop();
      client.distube.voices.leave(interaction.guildId);
      return interaction.reply({
        embeds: [statusEmbed(colors.error, "🚫 | There are no more songs in the queue!")],
      });
    }

    await queue.skip();
    await interaction.reply({ embeds: [statusEmbed(colors.info, "⏩ | Skipped!")] });
  },
};
