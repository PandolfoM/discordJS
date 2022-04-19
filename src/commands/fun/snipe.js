const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("Snipe last deleted message"),
  async execute(interaction, client) {
    try {
      const embed = new MessageEmbed()
        .setAuthor(
          client.snipes.get(interaction.channelId).author.tag,
          client.snipes
            .get(interaction.channelId)
            .author.avatarURL({ dynamic: true })
        )
        .setThumbnail(
          "https://media.tenor.com/images/14333b6252db0853a2c1331405e765c4/tenor.gif"
        )
        .addFields({
          name: "Sniped Message:",
          value: `${client.snipes.get(interaction.channelId).content}`,
        })
        .setColor("BLUE")
        .setTimestamp(`${client.snipes.get(interaction.channelId).timestamp}`);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        content: "No message to snipe",
        ephemeral: true,
      });
    }
  },
};
