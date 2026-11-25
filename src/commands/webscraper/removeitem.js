const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { removeUrl } = require("../../db/watchlist");
const { isAmazonUrl } = require("../../utils/amazon");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removeitem")
    .setDescription("Remove item from webscraper")
    .addStringOption((option) =>
      option.setName("url").setRequired(true).setDescription("AMAZON URLS ONLY"),
    ),
  async execute(interaction) {
    const url = interaction.options.getString("url").trim();

    if (!isAmazonUrl(url)) {
      return interaction.reply({ content: "Not a valid url", flags: MessageFlags.Ephemeral });
    }

    const removed = removeUrl(interaction.user.id, url);
    await interaction.reply({
      content: removed ? `Removed: ${url}` : "That URL isn't in your watch list",
      flags: MessageFlags.Ephemeral,
    });
  },
};
