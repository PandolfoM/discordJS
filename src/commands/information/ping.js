const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { client } = require("../../bot");

const embed = new MessageEmbed()
  .setColor("BLUE")
  .setTitle("Pong!")
  .addFields({ name: "Latency:", value: "Calculating..." });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply({ embeds: [embed] });
    const message = await interaction.fetchReply();
    let pingms = Date.now() - message.createdTimestamp;
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setColor("RED")
          .setTitle("Pong!")
          .addFields({ name: "Latency:", value: `${pingms}ms` })
          .addFields({ name: "Ping:", value: `${client.ws.ping}ms` })
          .setTimestamp(),
      ],
    });
  },
};
