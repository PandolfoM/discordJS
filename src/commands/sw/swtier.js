const path = require("node:path");
const { SlashCommandBuilder } = require("discord.js");

const IMAGE = path.join(__dirname, "../../content/img/swtier.png");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("swtier")
    .setDescription("Star Wars Tier List"),
  async execute(interaction) {
    await interaction.reply({ files: [IMAGE] });
  },
};
