const { SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");
const { hasDJ } = require("../../utils/musicUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the paused track"),
  async execute(interaction, client) {
    const channel = interaction.member?.voice.channel;
    const guildid = interaction.guild.id;

    if (await hasDJ(interaction)) {
      if (channel) {
        try {
          client.player.get(guildid).unpause();

          client.musicQueue.set(interaction.guild.id, {
            playing: true,
            queue: client.musicQueue.get(interaction.guild.id).queue,
          });

          await interaction.reply("Resuming...");
        } catch (error) {
          console.error(error);
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
