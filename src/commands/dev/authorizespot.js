const { SlashCommandBuilder } = require("discord.js");
const { authorization } = require("play-dl");
const ALLOWED_USERS = ["248910149442338816"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("authorizespot")
    .setDescription("Authorize spotify"),
  async execute(interaction) {
    if (ALLOWED_USERS.includes(interaction.user.id)) {
      authorization();
      interaction.reply({
        content: "Open up the server logs to continue...",
        ephemeral: true,
      });
    } else {
      interaction.reply({
        content: "You are not authorized to use this command.",
        ephemeral: true,
      });
    }
  },
};
