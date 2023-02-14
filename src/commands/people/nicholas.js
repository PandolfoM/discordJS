const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nicholas")
    .setDescription("El Goblino"),
  async execute(interaction, client) {
    const attachment =
      "https://cdn.discordapp.com/attachments/726299896243552276/966500471999176725/nickGoblin.png?size=4096";
    const embed = new MessageEmbed()
      .setColor("BLUE")
      .setTitle("El Goblino")
      .setImage(attachment);
    await interaction.reply({ embeds: [embed] });
  },
};
