const { SlashCommandBuilder, EmbedBuilder, InteractionContextType } = require("discord.js");
const colors = require("../../config/colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const { resource } = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setTitle("Pong!")
          .addFields({ name: "Latency:", value: "Calculating..." }),
      ],
      withResponse: true,
    });
    const latency = resource.message.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setTitle("Pong!")
          .addFields(
            { name: "Latency:", value: `${latency}ms` },
            { name: "Ping:", value: `${interaction.client.ws.ping}ms` },
          )
          .setTimestamp(),
      ],
    });
  },
};
