const { SlashCommandBuilder } = require("discord.js");
const { playNextTrack, hasDJ } = require("../../utils/musicUtils");
const { createAudioPlayer } = require("@discordjs/voice");
const colors = require("../../config/colors");
const { noDjEmbed, errorEmbed } = require("../../config/embeds");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip to the next track")
    .setDMPermission(false),
  async execute(interaction, client) {
    const channel = interaction.member?.voice.channel;
    const guildid = interaction.guild.id;
    const player = createAudioPlayer();

    if (await hasDJ(interaction, client)) {
      if (channel) {
        if (client.musicQueue.get(guildid)) {
          try {
            playNextTrack(guildid, client, interaction, player);
          } catch (error) {
            logger(error);
            await interaction.reply({ embeds: [errorEmbed] });
          }
        } else {
          await interaction.reply({
            embeds: [
              {
                color: colors.error,
                title: "There are no tracks in the queue",
              },
            ],
          });
        }
      } else {
        await interaction.reply({
          embeds: [
            {
              color: colors.error,
              title: "Join a voice channel and try again",
            },
          ],
        });
      }
    } else {
      await interaction.reply({
        embeds: [noDjEmbed],
      });
    }
  },
};
