const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("defaultdance")
    .setDescription("Default dance"),
  async execute(interaction) {
    const attachment = "./src/content/video/nicksturdy.mov";
    await interaction.reply({ files: [attachment] });
  },
};
