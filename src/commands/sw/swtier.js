const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("swtier")
    .setDescription("Star Wars Tier List"),
  async execute(interaction, client) {
    const attachment = './src/content/img/swtier.png'
    await interaction.reply({files: [attachment]})
  },
};
