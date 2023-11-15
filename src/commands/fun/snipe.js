const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const colors = require("../../config/colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("Snipe last deleted message"),
  async execute(interaction, client) {
    try {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: client.snipes.get(interaction.channelId).author.tag,
          iconURL: client.snipes
            .get(interaction.channelId)
            .author.avatarURL({ dynamic: true }),
        })
        .setThumbnail(
          "https://media.tenor.com/images/14333b6252db0853a2c1331405e765c4/tenor.gif"
        )
        .addFields({
          name: "Sniped Message:",
          value: `${client.snipes.get(interaction.channelId).content}`,
        })
        .setColor(colors.info)
        .setTimestamp(client.snipes.get(interaction.channelId).timestamp);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
      await interaction.reply({
        content: "No message to snipe",
        ephemeral: true,
      });
    }
  },
};
