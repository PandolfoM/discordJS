const { SlashCommandBuilder } = require("@discordjs/builders");
const colors = require("../../config/colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("Snipe last deleted message")
    .setDMPermission(false),
  async execute(interaction, client) {
    try {
      let image = false;
      if (client.snipes.get(interaction.channelId).content.includes("http")) {
        image = true;
      }

      const embed = {
        color: colors.info,
        title: "Sniped Message:",
        author: {
          name: client.snipes.get(interaction.channelId).author.tag,
          icon_url: client.snipes
            .get(interaction.channelId)
            .author.avatarURL({ dynamic: true }),
        },
        thumbnail: {
          url: "https://media.tenor.com/images/14333b6252db0853a2c1331405e765c4/tenor.gif",
        },
        fields: [
          {
            name: "",
            value: !image
              ? `${client.snipes.get(interaction.channelId).content}`
              : "",
          },
        ],
        image: {
          url: image
            ? `${client.snipes.get(interaction.channelId).content}`
            : "",
        },
        timestamp: client.snipes.get(interaction.channelId).timestamp,
      };
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        content: "No message to snipe",
        ephemeral: true,
      });
    }
  },
};
