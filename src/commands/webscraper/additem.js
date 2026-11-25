const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { addItem } = require("../../utils/firebaseUtils");
const { isAmazonUrl } = require("../../utils/amazon");
const webscrapeItem = require("../../functions/webscrapeItem");
const { errorEmbed } = require("../../config/embeds");
const colors = require("../../config/colors");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("Add item to webscraper")
    .addStringOption((option) =>
      option.setName("url").setRequired(true).setDescription("AMAZON URLS ONLY"),
    )
    .addStringOption((option) =>
      option.setName("name").setDescription("Name of the product"),
    ),
  async execute(interaction) {
    const url = interaction.options.getString("url").trim();

    if (!isAmazonUrl(url)) {
      return interaction.reply({
        embeds: [{ color: colors.error, title: "Not a valid url" }],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const name = interaction.options.getString("name") ?? (await webscrapeItem(url));
      if (!name) {
        return interaction.editReply({
          embeds: [
            {
              color: colors.error,
              title: "No item to add",
              description: "Couldn't read the product name. Try again with the `name` option.",
            },
          ],
        });
      }

      await addItem(interaction.user.id, { url, name });
      await interaction.editReply({
        embeds: [{ color: colors.success, title: `Added: ${name}`.slice(0, 256) }],
      });
    } catch (error) {
      logger(error);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
