const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const colors = require("../../config/colors");

const IMAGE =
  "https://cdn.discordapp.com/attachments/726299896243552276/966500471999176725/nickGoblin.png?size=4096";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nicholas")
    .setDescription("El Goblino"),
  async execute(interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setTitle("El Goblino")
          .setImage(IMAGE),
      ],
    });
  },
};
