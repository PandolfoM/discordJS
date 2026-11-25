const { SlashCommandBuilder } = require("discord.js");

const EMOJI = "<a:YAPPP:1195413955317862411>";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warzone")
    .setDescription("Warzone YAPP"),
  async execute(interaction) {
    await interaction.reply(
      `${EMOJI} word came down ${EMOJI} we are green to go ${EMOJI} so gear up and grab your shoots ${EMOJI} we're going to warzone ${EMOJI} rules of engagement are simple ${EMOJI} weapons free on all threats ${EMOJI}`,
    );
  },
};
