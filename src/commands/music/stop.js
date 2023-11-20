const { getVoiceConnection } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playing music"),
  async execute(interaction) {
    const channel = interaction.member?.voice.channel;

    if (channel) {
      try {
        const connection = getVoiceConnection(interaction.guild.id);

        connection.destroy();

        await interaction.reply("Bot disconnected");
      } catch (error) {
        console.error(error);
      }
    } else {
      await interaction.reply("Join a voice channel then try again!");
    }
  },
};
