const { SlashCommandBuilder } = require("@discordjs/builders");
const removeUrl = require("../../utils/firebaseUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removeurl")
    .setDescription("Remove item from webscraper")
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
        await removeUrl(interaction.user.id, url);
        await interaction.reply({
          content: `removed: ${url}`,
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
