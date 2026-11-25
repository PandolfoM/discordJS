const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  InteractionContextType,
  MessageFlags,
} = require("discord.js");
const { errorEmbed } = require("../../config/embeds");
const colors = require("../../config/colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete a specified number of messages.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1-100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    try {
      // `true` skips messages older than 14 days, which Discord can't bulk delete.
      const deleted = await interaction.channel.bulkDelete(amount, true);
      const skipped = amount - deleted.size;
      let title = `Successfully deleted ${deleted.size} message${deleted.size === 1 ? "" : "s"}.`;
      if (skipped > 0) {
        title += ` (${skipped} older than 14 days were skipped)`;
      }

      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(colors.success).setTitle(title)],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error while purging messages:", error);
      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }
  },
};
