const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mattsexy")
    .setDescription("Matt La Sexy!"),
  async execute(interaction, client) {
    const attachment = './src/content/audio/MattLaSexy.wav'
    await interaction.reply({files: [attachment]})
  },
};
