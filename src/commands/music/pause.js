const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current track"),
  async execute(interaction, client) {
    const channel = interaction.member?.voice.channel;
    const guildid = interaction.guild.id;

    if (channel) {
      try {
        client.player.get(guildid).pause();
        await interaction.reply("Paused track");
      } catch (error) {
        console.error(error);
        await interaction.reply("There has been an error!");
      }
    } else {
      await interaction.reply("Join a voice channel then try again!");
    }
  },
};
