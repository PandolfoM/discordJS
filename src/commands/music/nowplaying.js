const {
  EmbedBuilder,
  SlashCommandBuilder,
  InteractionContextType,
  escapeMarkdown,
} = require("discord.js");
const colors = require("../../config/colors");
const { ensureVoice, replyError } = require("../../utils/musicUtils");
const { safeUrl, songLink } = require("../../utils/songLink");

const BAR_LENGTH = 15;
const MAX_NAME = 200;

/** Uploader names come from YouTube/Spotify: show them as plain text only. */
function plainText(value) {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME);
  return (
    escapeMarkdown(text).replace(/[[\]]/g, (bracket) => `\\${bracket}`) ||
    "Unknown"
  );
}

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
    if (!song) {
      return replyError(interaction, "There is nothing playing!");
    }
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
          .setDescription(`> ${songLink(song, { bold: true })}\n\n${progress}`)
          .setThumbnail(safeUrl(song.thumbnail))
          .addFields(
            {
              name: "🎵 By",
              value: plainText(song.uploader?.name),
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
