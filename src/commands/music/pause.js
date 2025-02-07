const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current track"),

  async execute(interaction, client) {
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

    queue.pause();
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setAuthor({
            name: "Pause",
            iconURL: client.user.displayAvatarURL(),
          })
          .setDescription(`⏸️ | Paused current song!`),
      ],
    });
  },
};
