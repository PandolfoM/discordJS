const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { client } = require("../../bot");
const colors = require("../../config/colors");

const embed = new EmbedBuilder()
  .setColor(colors.info)
  .setTitle("Pong!")
  .addFields({ name: "Latency:", value: "Calculating..." });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .setDMPermission(false),
  async execute(interaction) {
    await interaction.reply({ embeds: [embed] });
    const message = await interaction.fetchReply();
    const pingms = Date.now() - message.createdTimestamp;
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setTitle("Pong!")
          .addFields({ name: "Latency:", value: `${pingms}ms` })
          .addFields({ name: "Ping:", value: `${client.ws.ping}ms` })
          .setTimestamp(),
      ],
    });
  },
};
