const { SlashCommandBuilder } = require("@discordjs/builders");
const { addItem } = require("../../utils/firebaseUtils");
const { errorEmbed } = require("../../config/embeds");
const colors = require("../../config/colors");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("Add item to webscraper")
    .addStringOption((option) =>
      option.setName("url").setRequired(true).setDescription("AMAZON URLS ONLY")
    )
    .addStringOption((option) =>
      option.setName("name").setDescription("Name of the product")
    ),
  async execute(interaction) {
    const url = interaction.options.getString("url");
    const name = interaction.options.getString("name");

    if (
      url.toLowerCase().includes("amazon.com") ||
      url.toLowerCase().includes("a.co")
    ) {
      try {
        await interaction.reply({
          embeds: [
            {
              color: colors.info,
              title: "Adding item...",
            },
          ],
          ephemeral: true,
        });
        const addFunc = await addItem(interaction, url, name);
        if (addFunc) {
          await interaction.editReply({
            embeds: [
              {
                color: colors.success,
                title: `Added: ${url}`,
              },
            ],
            ephemeral: true,
          });
        }
      } catch (error) {
        logger(error);
        await interaction.editReply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }
    } else {
      await interaction.reply({
        embeds: [
          {
            color: colors.error,
            title: "Not a valid url",
          },
        ],
        ephemeral: true,
      });
    }
  },
};
