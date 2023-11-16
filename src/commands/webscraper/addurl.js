const { SlashCommandBuilder } = require("@discordjs/builders");
const addUrl = require("../../utils/firebaseUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addurl")
    .setDescription("Add item to webscraper")
    .addStringOption((option) =>
      option.setName("url").setRequired(true).setDescription("AMAZON URLS ONLY")
    ),
  async execute(interaction) {
    const url = interaction.options.getString("url");

    if (
      url.toLowerCase().includes("amazon.com") ||
      url.toLowerCase().includes("a.co")
    ) {
      try {
        await addUrl(interaction.user.id, url);
        await interaction.reply({ content: `added: ${url}`, ephemeral: true });
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
