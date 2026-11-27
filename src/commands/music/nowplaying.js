const {
  EmbedBuilder,
  SlashCommandBuilder,
  InteractionContextType,
} = require("discord.js");
const colors = require("../../config/colors");
const { ensureVoice } = require("../../utils/musicUtils");

const BAR_LENGTH = 15;

/** Text progress bar, e.g. ▬▬▬▬🔘▬▬▬▬▬▬▬▬▬▬ */
function progressBar(current, total) {
  const ratio = total > 0 ? Math.min(current / total, 1) : 0;
  const position = Math.min(Math.floor(ratio * BAR_LENGTH), BAR_LENGTH - 1);
  return "▬".repeat(position) + "🔘" + "▬".repeat(BAR_LENGTH - position - 1);
}

module.exports = {
  category: "Music",
  progressBar,
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show the current song and how far into it we are")
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    // Read-only, like /queue: anyone in the voice channel can use it.
    const voice = await ensureVoice(interaction, client, { requireDJ: false });
    if (!voice) {
      return;
    }

    const { queue } = voice;
    const song = queue.songs[0];
    const progress = song.isLive
      ? "🔴 Live"
      : `${progressBar(queue.currentTime, song.duration)}\n` +
        `\`${queue.formattedCurrentTime} / ${song.formattedDuration}\``;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setAuthor({
            name: queue.paused ? "Paused" : "Now playing",
            iconURL: client.user.displayAvatarURL(),
          })
          .setDescription(`> [**${song.name}**](${song.url})\n\n${progress}`)
          .setThumbnail(song.thumbnail ?? null)
          .addFields(
            {
              name: "🎵 By",
              value: song.uploader?.name || "Unknown",
              inline: true,
            },
            {
              name: "👌 Request by",
              value: `${song.user ?? "Unknown"}`,
              inline: true,
            },
          ),
      ],
    });
  },
};
