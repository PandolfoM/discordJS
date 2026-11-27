const { SlashCommandBuilder, InteractionContextType } = require("discord.js");
const colors = require("../../config/colors");
const { statusEmbed } = require("../../config/embeds");
const {
  ensureVoice,
  positionError,
  replyError,
  upNextPosition,
} = require("../../utils/musicUtils");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("jump")
    .setDescription("Skip ahead to a song in the queue")
    .addIntegerOption((option) =>
      option
        .setName("position")
        .setDescription("Position in /queue's Up next list")
        .setMinValue(1)
        .setRequired(true),
    )
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }
    const { queue } = voice;
    const position = interaction.options.getInteger("position");
    if (!upNextPosition(queue, position)) {
      return replyError(interaction, positionError(queue));
    }

    // DisTube waits for any song that's still loading, which can exceed 3s.
    await interaction.deferReply();
    const song = await queue.jump(position);
    await interaction.editReply({
      embeds: [
        statusEmbed(
          colors.success,
          `⏭️ | Jumped to [${song.name}](${song.url}).`,
        ),
      ],
    });
  },
};
