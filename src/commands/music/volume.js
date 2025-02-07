const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Change the volume of the currently playing song (0-200)")
    .addIntegerOption((option) =>
      option
        .setName("volume")
        .setDescription("Volume percent")
        .setMaxValue(200)
        .setMinValue(0)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const volume = interaction.options.getInteger("volume");
    const voiceChannel = interaction.member.voice.channel;
    const queue = await client.distube.getQueue(interaction);
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

    if (volume < 0 || volume > 200) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.error)
            .setDescription(`🚫 | The volume value must be from 0 to 200!`),
        ],
        ephemeral: true,
      });
    }

    queue.setVolume(volume);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.success)
          .setDescription(
            `✅ | The volume has been changed to: ${volume}%/200%`
          ),
      ],
    });
  },
};
