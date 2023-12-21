const { SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");
const { hasDJ } = require("../../utils/musicUtils");
const { errorEmbed } = require("../../config/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current track")
    .setDMPermission(false),
  async execute(interaction, client) {
    const channel = interaction.member?.voice.channel;
    const guildid = interaction.guild.id;

    if (await hasDJ(interaction, client)) {
      if (channel) {
        try {
          client.player.get(guildid).pause();

          client.musicQueue.set(interaction.guild.id, {
            playing: false,
            queue: client.musicQueue.get(interaction.guild.id).queue,
          });

          await interaction.reply({
            embeds: [{ color: colors.info, title: "Paused track" }],
          });
        } catch (error) {
          console.error(error);
          await interaction.reply({ embeds: [errorEmbed] });
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
    }
  },
};
