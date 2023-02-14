const { SlashCommandBuilder } = require("@discordjs/builders");
const Character = require("../../schemas/characters");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("swdel")
    .setDescription("Delete information from the Star Wars database")
    .addStringOption((option) =>
      option
        .setName("id")
        .setRequired(true)
        .setDescription("Delete information")
    ),
  async execute(interaction, client) {
    let member = interaction.member.guild.members.cache.get(interaction.user.id)
    let hasRole = member.roles.cache.some(role => role.name === 'DB')
    if (hasRole) {

      let id = interaction.options.getString("id");
      const characterProfile = await client.delInfo(id);
      if (characterProfile) {
        await interaction.reply({
          content: `Successfully removed from database`,
        });
      } else {
        await interaction.reply({ content: `Failed to remove from database` });
      }
    } else {
      interaction.reply({content: 'You do not have permission', ephemeral: true})
    }
  },
};
