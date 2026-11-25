const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  InteractionContextType,
} = require("discord.js");
const colors = require("../../config/colors");

const VIDEO_PATTERN = /\.(mp4|webm|mov)(\?|$)/i;
const SNIPE_GIF = "https://media.tenor.com/images/14333b6252db0853a2c1331405e765c4/tenor.gif";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("Snipe last deleted message")
    .setContexts(InteractionContextType.Guild),
  async execute(interaction, client) {
    const snipe = client.snipes.get(interaction.channelId);
    if (!snipe) {
      return interaction.reply({
        embeds: [{ color: colors.error, title: "No message to snipe" }],
      });
    }

    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setColor(colors.info)
      .setTitle("Sniped Message:")
      .setAuthor({
        name: snipe.author.username,
        iconURL: snipe.author.displayAvatarURL(),
      })
      .setThumbnail(SNIPE_GIF)
      .setTimestamp(snipe.timestamp);

    if (snipe.content) {
      embed.setDescription(snipe.content.slice(0, 4096));
    }

    if (snipe.img && VIDEO_PATTERN.test(snipe.img)) {
      return interaction.editReply({
        embeds: [embed],
        files: [new AttachmentBuilder(snipe.img)],
      });
    }
    if (snipe.img) {
      embed.setImage(snipe.img);
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
