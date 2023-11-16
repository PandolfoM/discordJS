const { SlashCommandBuilder } = require("@discordjs/builders");
const { addItem } = require("../../utils/firebaseUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("Add item to webscraper")
    .addStringOption((option) =>
      option.setName("url").setRequired(true).setDescription("AMAZON URLS ONLY")
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setRequired(true)
        .setDescription("Name of the product")
    ),
  async execute(interaction) {
    const url = interaction.options.getString("url");
    const name = interaction.options.getString("name");

    if (
      url.toLowerCase().includes("amazon.com") ||
      url.toLowerCase().includes("a.co")
    ) {
      try {
        await addItem(interaction.user.id, url, name);
        await interaction.reply({
          content: `added: ${url}`,
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await interaction.reply({
          content: "Not a valid url",
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
      }
    }
  },
};
