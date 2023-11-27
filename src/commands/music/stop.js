const { getVoiceConnection } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");
const { hasDJ } = require("../../utils/musicUtils");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playing music"),
  async execute(interaction, client) {
    const channel = interaction.member?.voice.channel;
    const guildid = interaction.guild.id;

    if (await hasDJ(interaction)) {
      if (channel) {
        try {
          if (client.musicQueue.get(guildid) === undefined) {
            return await interaction.reply({
              embeds: [
                { color: colors.error, title: "I am not playing any music" },
              ],
            });
          }

          const connection = getVoiceConnection(guildid);

          connection.destroy();
          client.player.get(guildid).stop();

          client.musicQueue.set(guildid, {
            playing: false,
            queue: [],
          });

          await interaction.reply({
            embeds: [{ color: colors.info, title: "Bot disconnected" }],
          });
        } catch (error) {
          logger(error);
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
