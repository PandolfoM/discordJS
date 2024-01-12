const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("warzone")
    .setDescription("Warzone YAPP"),
  async execute(interaction) {
    const emoji = `<a:YAPPP:1195413955317862411>`;
    await interaction.reply(
      `${emoji} word came down ${emoji} we are green to go ${emoji} so gear up and grab your shoots ${emoji} we're going to warzone ${emoji} rules of engagement are simple ${emoji} weapons free on all threats ${emoji}`
    );
  },
};
