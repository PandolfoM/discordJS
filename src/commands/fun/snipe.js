const { SlashCommandBuilder } = require("@discordjs/builders");
const colors = require("../../config/colors");
const { AttachmentBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("Snipe last deleted message")
    .setDMPermission(false),
  async execute(interaction, client) {
    try {
      const snipeContent = client.snipes.get(interaction.channelId).content;
      const snipeImg = client.snipes.get(interaction.channelId).img;

      const embed = new EmbedBuilder()
        .setColor(colors.info)
        .setTitle("Sniped Message:")
        .setAuthor({
          name: client.snipes.get(interaction.channelId).author.tag,
          iconURL: client.snipes
            .get(interaction.channelId)
            .author.avatarURL({ dynamic: true }),
        })
        .setThumbnail(
          "https://media.tenor.com/images/14333b6252db0853a2c1331405e765c4/tenor.gif"
        )
        .setTimestamp(client.snipes.get(interaction.channelId).timestamp);

      if (snipeContent) {
        embed.addFields({
          name: snipeContent,
          value: " ",
        });
      }

      if (snipeImg) {
        if (
          snipeImg.includes(".mp4") ||
          snipeImg.includes(".webm") ||
          snipeImg.includes(".mov")
        ) {
          const videoAttachment = new AttachmentBuilder(snipeImg);
          await interaction.deferReply();
          return await interaction.editReply({
            embeds: [embed],
            files: [videoAttachment],
          });
        }

        embed.setImage(snipeImg);
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        content: "No message to snipe",
        ephemeral: true,
      });
    }
  },
};
