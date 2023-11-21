const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { errorEmbed } = require("../../config/embeds");
const colors = require("../../config/colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete a specified number of messages.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete")
        .setRequired(true)
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    const validNumber = new EmbedBuilder()
      .setColor(colors.info)
      .setTitle("Provide a number between 1 and 100.");

    if (amount <= 0 || amount > 100) {
      return interaction.reply({ embeds: [validNumber], ephemeral: true });
    }

    try {
      const fetched = await interaction.channel.messages.fetch({
        limit: amount,
      });
      interaction.channel.bulkDelete(fetched);

      const embed = new EmbedBuilder()
        .setColor(colors.success)
        .setTitle(
          `Successfully deleted ${amount} message${amount > 1 ? "s" : ""}.`
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error while purging messages:", error);
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
