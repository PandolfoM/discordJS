const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("rewind")
    .setDescription("Play previous song in the queue"),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.error)
            .setDescription(
              `🚫 | You must be in a voice channel to use this command!`
            ),
        ],
      });
    }
    if (
      interaction.guild.members.me.voice.channelId !==
      interaction.member.voice.channelId
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.error)
            .setDescription(
              `🚫 | You need to be on the same voice channel as the Bot!`
            ),
        ],
      });
    }
    try {
      await client.distube.previous(interaction);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.success)
            .setAuthor({
              name: "Playback",
              iconURL: client.user.displayAvatarURL(),
            })
            .setDescription(`🎵 | Rewinding...`),
        ],
      });
    } catch (err) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.error)
            .setDescription(
              `🚫 | The previous song in the playlist cannot be played back!`
            ),
        ],
        ephemeral: true,
      });
    }
  },
};
