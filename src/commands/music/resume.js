const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the paused track"),
  async execute(interaction, client) {
    const channel = interaction.member?.voice.channel;
    const guildid = interaction.guild.id;

    if (channel) {
      try {
        client.player.get(guildid).unpause();
        await interaction.reply("Resuming...");
      } catch (error) {
        console.error(error);
        await interaction.reply("There has been an error!");
      }
    } else {
      await interaction.reply("Join a voice channel then try again!");
    }
  },
};
