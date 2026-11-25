const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  InteractionContextType,
  ChannelType,
} = require("discord.js");
const { updateGuildSetting } = require("../../utils/guildSettings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("devchannel")
    .setDescription("Set a channel where devs can test commands (leave empty to clear)")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Dev channel")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    await updateGuildSetting(
      interaction,
      "devChannel",
      channel?.id ?? "0",
      channel ? `Dev channel set to ${channel}` : "Dev channel removed",
    );
  },
};
