const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const colors = require("../../config/colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nicholas")
    .setDescription("El Goblino"),
  async execute(interaction) {
    const attachment =
      "https://cdn.discordapp.com/attachments/726299896243552276/966500471999176725/nickGoblin.png?size=4096";
    const embed = new EmbedBuilder()
      .setColor(colors.info)
      .setTitle("El Goblino")
      .setImage(attachment);
    await interaction.reply({ embeds: [embed] });
  },
};
