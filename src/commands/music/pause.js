const { SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");
const { hasDJ } = require("../../utils/musicUtils");
const Logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current track"),
  async execute(interaction, client) {
    const channel = interaction.member?.voice.channel;
    const guildid = interaction.guild.id;

    if (await hasDJ(interaction)) {
      if (channel) {
        try {
          client.player.get(guildid).pause();

          client.musicQueue.set(interaction.guild.id, {
            playing: false,
            queue: client.musicQueue.get(interaction.guild.id).queue,
          });

          await interaction.reply("Paused track");
        } catch (error) {
          Logger(error);
          await interaction.reply("There has been an error!");
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
