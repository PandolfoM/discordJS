const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const embed = new MessageEmbed()
  .setColor("RED")
  .setTitle("Pong!")
  .addFields({ name: "Latency:", value: "Calculating..." })
  .setTimestamp();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    console.log(interaction);
    await interaction.reply({ embeds: [embed] });
    const message = await interaction.fetchReply();
    let pingms = Date.now() - message.createdTimestamp;
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setColor("RED")
          .setTitle("Pong!")
          .addFields({ name: "Latency:", value: `${pingms}ms` })
          .setTimestamp(),
      ],
    });
  },
};
