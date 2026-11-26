const { SlashCommandBuilder, InteractionContextType } = require("discord.js");
const { RepeatMode } = require("distube");
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

    // DisTube waits for any song that's still loading, which can exceed 3s.
    await interaction.deferReply();

    if (queue.songs.length > 1 || queue.autoplay) {
      await queue.skip();
      return interaction.editReply({
        embeds: [statusEmbed(colors.info, "⏩ | Skipped!")],
      });
    }

    // Last song in the queue: with "Repeat song list" on, loop back to its start.
    if (queue.repeatMode === RepeatMode.QUEUE) {
      await queue.seek(0);
      return interaction.editReply({
        embeds: [
          statusEmbed(
            colors.info,
            "🔁 | Skipped! Starting the playlist again.",
          ),
        ],
      });
    }

    await queue.stop();
    client.distube.voices.leave(interaction.guildId);
    await interaction.editReply({
      embeds: [
        statusEmbed(
          colors.info,
          "⏹️ | That was the last song, so I stopped playing.",
        ),
      ],
    });
  },
};
