const { EmbedBuilder, SlashCommandBuilder, InteractionContextType } = require("discord.js");
const { RepeatMode } = require("distube");
const colors = require("../../config/colors");
const { ensureVoice } = require("../../utils/musicUtils");

const UP_NEXT_COUNT = 10;
const REPEAT_LABELS = {
  [RepeatMode.DISABLED]: "Off",
  [RepeatMode.SONG]: "Song",
  [RepeatMode.QUEUE]: "Playlist",
};

const plural = (n) => (n === 1 ? "" : "s");
const songLink = (song) => `[${song.name}](${song.url})`;

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("See the list of songs in the queue!")
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    // Anyone in the channel can look at the queue; only DJs can change it.
    const voice = await ensureVoice(interaction, client, { requireDJ: false });
    if (!voice) {
      return;
    }

    const { queue } = voice;
    const [current, ...upcoming] = queue.songs;

    const nowPlaying =
      `${songLink(current)}\n` +
      `\`${queue.formattedCurrentTime} / ${current.formattedDuration}\`` +
      `${queue.paused ? " ⏸️" : ""} | Request by: ${current.user ?? "Unknown"}`;

    let upNext = upcoming
      .slice(0, UP_NEXT_COUNT)
      .map((song, i) => `**${i + 1}.** ${songLink(song)} \`${song.formattedDuration}\``)
      .join("\n");
    const hidden = upcoming.length - UP_NEXT_COUNT;
    if (hidden > 0) {
      upNext += `\n...and **${hidden}** more song${plural(hidden)}`;
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setAuthor({ name: "Queue", iconURL: client.user.displayAvatarURL() })
          .addFields(
            { name: "▶️ Now playing", value: nowPlaying.slice(0, 1024) },
            { name: "⏭️ Up next", value: (upNext || "Nothing else queued").slice(0, 1024) },
            { name: "Songs", value: `${queue.songs.length}`, inline: true },
            { name: "Total time", value: queue.formattedDuration, inline: true },
            { name: "Repeat", value: REPEAT_LABELS[queue.repeatMode], inline: true },
          ),
      ],
    });
  },
};
