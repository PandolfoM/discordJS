const { EmbedBuilder, SlashCommandBuilder, InteractionContextType } = require("discord.js");
const colors = require("../../config/colors");
const { ensureVoice, replyError } = require("../../utils/musicUtils");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current track")
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }
    if (voice.queue.paused) {
      return replyError(interaction, "The song is already paused!");
    }

    await voice.queue.pause();
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setAuthor({ name: "Pause", iconURL: client.user.displayAvatarURL() })
          .setDescription("⏸️ | Paused current song!"),
      ],
    });
  },
};
