const { SlashCommandBuilder, InteractionContextType } = require("discord.js");
const colors = require("../../config/colors");
const { statusEmbed } = require("../../config/embeds");
const { songLink } = require("../../utils/songLink");
const {
  ensureVoice,
  positionError,
  replyError,
  upNextPosition,
} = require("../../utils/musicUtils");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a song from the queue")
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

    const [song] = queue.songs.splice(position, 1);
    await interaction.reply({
      embeds: [
        statusEmbed(
          colors.success,
          `🗑️ | Removed ${songLink(song)} from the queue.`,
        ),
      ],
    });
  },
};
