const { EmbedBuilder, SlashCommandBuilder, InteractionContextType } = require("discord.js");
const colors = require("../../config/colors");
const { ensureVoice } = require("../../utils/musicUtils");

const PAGE_SIZE = 10;
const plural = (n) => (n === 1 ? "" : "s");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("See the list of songs in the queue!")
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }

    const { queue } = voice;
    const [current] = queue.songs;
    const total = queue.songs.length;

    const tracks = queue.songs
      .slice(0, PAGE_SIZE)
      .map(
        (song, i) =>
          `**${i + 1}** - [${song.name}](${song.url}) | ${song.formattedDuration}\nRequest by: ${song.user}`,
      );
    const summary =
      total > PAGE_SIZE
        ? `And **${total - PAGE_SIZE}** more song${plural(total - PAGE_SIZE)}...`
        : `Playlist **${total}** song${plural(total)}...`;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setAuthor({ name: "Queue", iconURL: client.user.displayAvatarURL() })
          .setDescription(`${tracks.join("\n")}\n\n${summary}`.slice(0, 4096))
          .addFields(
            {
              name: "> Playing:",
              value: `[${current.name}](${current.url}) - ${current.formattedDuration} | Request by: ${current.user}`.slice(0, 1024),
              inline: true,
            },
            { name: "> Total times:", value: queue.formattedDuration, inline: true },
            { name: "> Total songs:", value: `${total}`, inline: true },
          ),
      ],
    });
  },
};
