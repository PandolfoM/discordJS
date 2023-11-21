const { getVoiceConnection } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");
const { hasDJ } = require("../../utils/musicUtils");

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
          const connection = getVoiceConnection(guildid);

          connection.destroy();
          client.player.get(guildid).stop();

          client.musicQueue.set(interaction.guild.id, {
            playing: false,
            queue: [],
          });

          await interaction.reply("Bot disconnected");
        } catch (error) {
          console.error(error);
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
