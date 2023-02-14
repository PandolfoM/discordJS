const { SlashCommandBuilder } = require("@discordjs/builders");
const Character = require("../../schemas/characters");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("swid")
    .setDescription("Get id of information")
    .addStringOption((option) =>
      option
        .setName("character")
        .setRequired(true)
        .setDescription("Find id of character")
    ),
  async execute(interaction, client) {
    let member = interaction.member.guild.members.cache.get(interaction.user.id)
    let hasRole = member.roles.cache.some(role => role.name === 'DB')
    let character = interaction.options.getString("character");
    const characterProfile = await client.getId(interaction.member, character);
    if (hasRole) {

      if (!characterProfile) {
        await interaction.reply({ content: "No character found!" });
      } else {
        await interaction.reply({ content: `${characterProfile._id}` });
      }
    } else {
      interaction.reply({content: 'You do not have permission', ephemeral: true})
    }
  },
};
