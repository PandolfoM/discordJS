const { SlashCommandBuilder, InteractionContextType } = require("discord.js");
const colors = require("../../config/colors");
const { statusEmbed } = require("../../config/embeds");
const { ensureVoice } = require("../../utils/musicUtils");

const FILTERS = ["off", "3d", "bassboost", "echo", "karaoke", "nightcore", "surround"];

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Add a filter to the audio")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Select filter type")
        .setRequired(true)
        .addChoices(...FILTERS.map((filter) => ({ name: filter, value: filter }))),
    )
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }

    const filter = interaction.options.getString("type");
    if (filter === "off") {
      voice.queue.filters.clear();
    } else {
      voice.queue.filters.set([filter]);
    }

    await interaction.reply({
      embeds: [
        statusEmbed(
          colors.success,
          filter === "off" ? "Filters have been removed!" : `Filter \`${filter}\` has been added to the audio!`,
        ),
      ],
    });
  },
};
