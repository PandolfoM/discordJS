const { SlashCommandBuilder, InteractionContextType } = require("discord.js");
const colors = require("../../config/colors");
const { statusEmbed } = require("../../config/embeds");
const { ensureVoice, replyError } = require("../../utils/musicUtils");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the songs that are up next")
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }
    if (voice.queue.songs.length < 3) {
      return replyError(
        interaction,
        "Need at least 2 songs up next to shuffle!",
      );
    }

    // DisTube waits for any song that's still loading, which can exceed 3s.
    await interaction.deferReply();
    await voice.queue.shuffle();
    await interaction.editReply({
      embeds: [
        statusEmbed(
          colors.success,
          `🔀 | Shuffled ${voice.queue.songs.length - 1} songs!`,
        ),
      ],
    });
  },
};
