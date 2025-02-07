const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const colors = require("../../config/colors");
const { hasDJ } = require("../../utils/musicUtils");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The keyword or URL of the song to play")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const keyword = interaction.options.getString("song");

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
        ephemeral: true,
      });
    }

    if (queue) {
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
          ephemeral: true,
        });
      }
    }

    if (await hasDJ(interaction, client)) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.info)
            .setDescription(`🔍 | Looking for song...`),
        ],
        ephemeral: true,
      });

      client.distube.play(voiceChannel, keyword, {
        textChannel: interaction.channel,
        member: interaction.member,
      });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.success)
            .setDescription(`🔍 | Successful search!`),
        ],
        ephemeral: true,
      });
    }
  },
};
