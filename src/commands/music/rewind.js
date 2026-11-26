const {
  EmbedBuilder,
  SlashCommandBuilder,
  InteractionContextType,
} = require("discord.js");
const colors = require("../../config/colors");
const { ensureVoice, replyError } = require("../../utils/musicUtils");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("rewind")
    .setDescription("Play previous song in the queue")
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }

    // DisTube waits for any song that's still loading, which can exceed 3s.
    await interaction.deferReply();
    try {
      await voice.queue.previous();
    } catch {
      return replyError(
        interaction,
        "The previous song in the playlist cannot be played back!",
      );
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.success)
          .setAuthor({
            name: "Playback",
            iconURL: client.user.displayAvatarURL(),
          })
          .setDescription("🎵 | Rewinding..."),
      ],
    });
  },
};
