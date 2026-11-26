const path = require("node:path");
const { SlashCommandBuilder } = require("discord.js");

const AUDIO = path.join(__dirname, "../../content/audio/MattLaSexy.wav");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mattsexy")
    .setDescription("Matt La Sexy!"),
  async execute(interaction) {
    await interaction.reply({ files: [AUDIO] });
  },
};
