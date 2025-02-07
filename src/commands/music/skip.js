const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip track"),

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

    if (queue.songs.length === 1) {
      queue.stop();
      client.distube.voices.leave(interaction);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.error)
            .setDescription(`🚫 | There are no more songs in the queue!`),
        ],
      });
      return;
    } else {
      queue.skip();
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.info)
            .setDescription(`⏩ | Skipped!`),
        ],
      });
    }
  },
};
