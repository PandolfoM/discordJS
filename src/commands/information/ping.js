const { SlashCommandBuilder } = require("@discordjs/builders");
const { client } = require('../../bot')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply({ content: `Pong! My ping is ${client.ws.ping}ms!` });
  },
};
