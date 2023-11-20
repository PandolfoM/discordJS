const { getVoiceConnection } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playing music"),
  async execute(interaction, client) {
    const channel = interaction.member?.voice.channel;
    const guildid = interaction.guild.id;

    if (channel) {
      try {
        const connection = getVoiceConnection(guildid);

        connection.destroy();
        client.player.get(guildid).stop();

        await interaction.reply("Bot disconnected");
      } catch (error) {
        console.error(error);
      }
    } else {
      await interaction.reply("Join a voice channel then try again!");
    }
  },
};
