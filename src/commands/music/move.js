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

const positionOption = (name, description) => (option) =>
  option
    .setName(name)
    .setDescription(description)
    .setMinValue(1)
    .setRequired(true);

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Move a song to another spot in the queue")
    .addIntegerOption(positionOption("from", "Current position (see /queue)"))
    .addIntegerOption(positionOption("to", "New position"))
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }
    const { queue } = voice;
    const from = interaction.options.getInteger("from");
    const to = interaction.options.getInteger("to");
    if (!upNextPosition(queue, from) || !upNextPosition(queue, to)) {
      return replyError(interaction, positionError(queue));
    }

    const [song] = queue.songs.splice(from, 1);
    queue.songs.splice(to, 0, song);
    await interaction.reply({
      embeds: [
        statusEmbed(
          colors.success,
          `↕️ | Moved ${songLink(song)} to position ${to}.`,
        ),
      ],
    });
  },
};
