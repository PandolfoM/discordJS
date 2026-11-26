const path = require("node:path");
const { SlashCommandBuilder } = require("discord.js");

const VIDEO = path.join(__dirname, "../../content/video/nicksturdy.mov");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("defaultdance")
    .setDescription("Default dance"),
  async execute(interaction) {
    await interaction.reply({ files: [VIDEO] });
  },
};
