const {
  EmbedBuilder,
  SlashCommandBuilder,
  InteractionContextType,
  MessageFlags,
  escapeMarkdown,
} = require("discord.js");
const colors = require("../../config/colors");
const { replyError } = require("../../utils/musicUtils");

const API = "https://lrclib.net/api/search";
const MAX_LYRICS = 4000; // embed descriptions max out at 4096
const DURATION_TOLERANCE = 5; // seconds

/**
 * Turns a YouTube-style title into a search query, e.g.
 * "Morgan Wallen - Missing (Official Lyric Video) [HD]" -> "Morgan Wallen - Missing".
 */
function searchQuery(song) {
  const title = song.name
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .replace(/\s[|]\s.*$/, " ")
    .replace(
      /\b(official|lyrics?|music|video|audio|visuali[sz]er|hd|4k)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
  const artist = (song.uploader?.name ?? "")
    .replace(/\s*-\s*Topic$|VEVO$|\bofficial\b/gi, "")
    .trim();
  // "Artist - Title" already names the artist; otherwise add the uploader.
  return title.includes(" - ") || !artist ? title : `${artist} ${title}`;
}

async function findLyrics(query, duration) {
  const response = await fetch(`${API}?q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": "epicans-discord-bot" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`LRCLIB returned ${response.status}`);
  }
  const results = (await response.json()).filter((r) => r.plainLyrics);
  // Prefer a version with the same length as the song that's playing, then
  // one with a clean name over uploads like "Artist - Song (Lyric Video)".
  const sameLength = duration
    ? results.filter(
        (r) => Math.abs(r.duration - duration) <= DURATION_TOLERANCE,
      )
    : [];
  const candidates = sameLength.length ? sameLength : results;
  return candidates.find((r) => !/[([]| - /.test(r.trackName)) ?? candidates[0];
}

module.exports = {
  category: "Music",
  searchQuery,
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Show the lyrics of the current song, or search for a song")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("Song to search for (defaults to the current song)")
        .setMaxLength(100),
    )
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const search = interaction.options.getString("song");
    const current = client.distube.getQueue(interaction.guildId)?.songs[0];
    if (!search && !current) {
      return replyError(
        interaction,
        "Nothing is playing. Use /lyrics song:<name> to search.",
      );
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const query = search ?? searchQuery(current);
    const result = await findLyrics(query, search ? null : current.duration);
    if (!result) {
      return replyError(
        interaction,
        `No lyrics found for "${escapeMarkdown(query).replace(/[[\]]/g, "\\$&")}".`,
      );
    }

    // Lyrics are user-submitted on LRCLIB: escape markdown so they can't
    // render as masked links or formatting.
    const text = escapeMarkdown(result.plainLyrics).replace(/[[\]]/g, "\\$&");
    const lyrics =
      text.length > MAX_LYRICS ? `${text.slice(0, MAX_LYRICS)}…` : text;
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setTitle(`${result.artistName} - ${result.trackName}`.slice(0, 256))
          .setDescription(lyrics)
          .setFooter({ text: "Lyrics from LRCLIB" }),
      ],
    });
  },
};
