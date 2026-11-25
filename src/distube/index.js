const { DisTube } = require("distube");
const { EmbedBuilder } = require("discord.js");
const { SpotifyPlugin } = require("@distube/spotify");
const { YouTubePlugin } = require("@distube/youtube");
const { AppleMusicPlugin } = require("distube-apple-music");
const ffmpegPath = require("ffmpeg-static");
const { client } = require("../bot");
const colors = require("../config/colors");
const { statusEmbed } = require("../config/embeds");

const DEFAULT_VOLUME = 20;
const formatNumber = new Intl.NumberFormat();

client.distube = new DisTube(client, {
  ffmpeg: { path: ffmpegPath },
  nsfw: true,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: true,
  emitAddListWhenCreatingQueue: true,
  plugins: [
    new YouTubePlugin(),
    new SpotifyPlugin({
      api: {
        clientId: process.env.SPOTIFTYCLIENTID,
        clientSecret: process.env.SPOTIFTYCLIENTSECRET,
        topTracksCountry: "US",
      },
    }),
    new AppleMusicPlugin(),
  ],
});

const send = (queue, embed) =>
  queue.textChannel?.send({ embeds: [embed] }).catch((error) => {
    console.error("Failed to send DisTube message:", error);
  });

const queueFooter = (queue) => ({
  text: `${formatNumber.format(queue.songs.length)} songs in queue`,
});

const status = (queue) =>
  `Volume: \`${queue.volume}%\` | Filter: \`${
    queue.filters.names.join(", ") || "Off"
  }\` | Repeat: \`${
    queue.repeatMode ? (queue.repeatMode === 2 ? "Playlist" : "Song") : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

client.distube
  .on("initQueue", (queue) => {
    queue.autoplay = false;
    queue.setVolume(DEFAULT_VOLUME);
  })
  .on("addSong", (queue, song) =>
    send(
      queue,
      new EmbedBuilder()
        .setColor(colors.info)
        .setAuthor({ name: "Added song to queue" })
        .setDescription(`> [**${song.name}**](${song.url})`)
        .setThumbnail(song.thumbnail ?? null)
        .addFields(
          { name: "🎵 By", value: song.uploader?.name || "Unknown" },
          { name: "👌 Request by", value: `${song.user}` },
        )
        .setFooter(queueFooter(queue)),
    ),
  )
  .on("addList", (queue, playlist) =>
    send(
      queue,
      new EmbedBuilder()
        .setColor(colors.info)
        .setAuthor({ name: "Add playlist to queue" })
        .setThumbnail(playlist.thumbnail ?? null)
        .setDescription(`> [**${playlist.name}**](${playlist.url})`)
        .addFields({ name: "👌 | Request by", value: `${playlist.user}` })
        .setFooter(queueFooter(queue)),
    ),
  )
  .on("playSong", (queue, song) =>
    send(
      queue,
      new EmbedBuilder()
        .setColor(colors.success)
        .setAuthor({ name: "Now playing" })
        .setDescription(`> [**${song.name}**](${song.url})`)
        .setThumbnail(song.thumbnail ?? null)
        .addFields(
          { name: "🔷 | Status", value: status(queue) },
          { name: "👌 | Request by", value: `${song.user}` },
        )
        .setFooter(queueFooter(queue)),
    ),
  )
  .on("error", (error, queue) => {
    console.error("DisTube error:", error);
    if (queue) {
      send(
        queue,
        statusEmbed(
          colors.error,
          `🚫 | An error has occurred!\n\n**${String(error).slice(0, 1974)}**`,
        ),
      );
    }
  })
  .on("disconnect", (queue) =>
    send(queue, statusEmbed(colors.error, "🚫 | The bot has disconnected from the voice channel!")),
  )
  .on("finish", (queue) =>
    send(queue, statusEmbed(colors.error, "🚫 | All songs on the playlist have been played!")),
  )
  .on("noRelated", (queue) =>
    send(queue, statusEmbed(colors.error, "🚫 | Song not found!")),
  );
