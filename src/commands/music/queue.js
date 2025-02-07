const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("See the list of songs in the queue!"),

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

    if (!queue) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.error)
            .setDescription(`🚫 | There are no songs in the queue!`),
        ],
        ephemeral: true,
      });
    }

    const tracks = queue.songs.map(
      (song, i) => `**${i + 1}** - [${song.name}](${song.url}) | ${
        song.formattedDuration
      }
        Request by: ${song.user}`
    );

    const songs = queue.songs.length;
    const nextSongs =
      songs > 10
        ? `And **${songs - 10}** more song${songs > 1 ? "s" : ""}...`
        : `Playlist **${songs}** song${songs > 1 ? "s" : ""}...`;

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setAuthor({
            name: "Queue",
            iconURL: client.user.displayAvatarURL(),
          })
          .setDescription(`${tracks.slice(0, 10).join("\n")}\n\n${nextSongs}`)
          .addFields([
            {
              name: "> Playing:",
              value: `[${queue.songs[0].name}](${queue.songs[0].url}) - ${queue.songs[0].formattedDuration} | Request by: ${queue.songs[0].user}`,
              inline: true,
            },
            {
              name: "> Total times:",
              value: `${queue.formattedDuration}`,
              inline: true,
            },
            {
              name: "> Total songs:",
              value: `${songs}`,
              inline: true,
            },
          ]),
      ],
    });
  },
};
