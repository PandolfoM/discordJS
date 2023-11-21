const { SlashCommandBuilder } = require("discord.js");
const { playNextTrack, hasDJ } = require("../../utils/musicUtils");
const { createAudioPlayer } = require("@discordjs/voice");
const colors = require("../../config/colors");
const Logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip to the next track"),
  async execute(interaction, client) {
    const channel = interaction.member?.voice.channel;
    const guildid = interaction.guild.id;
    const player = createAudioPlayer();

    if (await hasDJ(interaction)) {
      if (channel) {
        if (client.musicQueue.get(guildid)) {
          try {
            playNextTrack(guildid, client, interaction, player);
          } catch (error) {
            Logger(error);
            await interaction.reply({
              embeds: [
                {
                  color: colors.error,
                  title: "There was an error",
                },
              ],
            });
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
        await interaction.reply(
          await interaction.reply({
            embeds: [
              {
                color: colors.error,
                title: "Join a voice channel and try again",
              },
            ],
          })
        );
      }
    }
  },
};
