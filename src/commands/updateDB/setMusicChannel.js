const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  InteractionContextType,
  ChannelType,
} = require("discord.js");
const { updateGuildSetting } = require("../../utils/guildSettings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("musicchannel")
    .setDescription("Set a channel where music can be played (leave empty to clear)")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Music channel")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    await updateGuildSetting(
      interaction,
      "musicChannel",
      channel?.id ?? "0",
      channel ? `Music channel set to ${channel}` : "Music channel removed",
    );
  },
};
