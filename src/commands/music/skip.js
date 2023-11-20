const { SlashCommandBuilder } = require("discord.js");
const { playNextTrack } = require("../../utils/musicUtils");
const { createAudioPlayer } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip to the next track"),
  async execute(interaction, client) {
    const channel = interaction.member?.voice.channel;
    const guildid = interaction.guild.id;
    const player = createAudioPlayer();

    if (channel) {
      try {
        playNextTrack(guildid, client, interaction, player);
      } catch (error) {
        await interaction.reply("There has been an error!");
      }
    } else {
      await interaction.reply("Join a voice channel then try again!");
    }
  },
};
