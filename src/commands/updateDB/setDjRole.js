const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  InteractionContextType,
} = require("discord.js");
const { updateGuildSetting } = require("../../utils/guildSettings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("djrole")
    .setDescription("Set the server DJ role (leave empty to clear)")
    .addRoleOption((option) =>
      option.setName("role").setDescription("DJ role"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const role = interaction.options.getRole("role");
    await updateGuildSetting(
      interaction,
      "djRole",
      role?.id ?? null,
      role ? `DJ role set to ${role}` : "DJ role removed",
    );
  },
};
