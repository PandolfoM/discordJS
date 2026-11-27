const { DisTube, RepeatMode } = require("distube");
const { EmbedBuilder, Events } = require("discord.js");
const { SpotifyPlugin } = require("@distube/spotify");
const { YouTubePlugin } = require("@distube/youtube");
const { AppleMusicPlugin } = require("distube-apple-music");
const ffmpegPath = require("ffmpeg-static");
const { client } = require("../bot");
const colors = require("../config/colors");
const { statusEmbed } = require("../config/embeds");
const logger = require("../utils/logger");

const DEFAULT_VOLUME = 20;
const IDLE_LEAVE_MS = 60 * 1000;
const formatNumber = new Intl.NumberFormat();

client.distube = new DisTube(client, {
  // FFMPEG_PATH lets a server use its own ffmpeg when the bundled build
  // doesn't run there.
  ffmpeg: { path: process.env.FFMPEG_PATH || ffmpegPath },
  nsfw: true,
  emitNewSongOnly: true,
  // "Now playing" already announces the first song of a new queue.
  emitAddSongWhenCreatingQueue: false,
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
    logger("Failed to send DisTube message:", error);
  });

const queueFooter = (queue) => ({
  text: `${formatNumber.format(queue.songs.length)} songs in queue`,
});

const REPEAT_LABELS = {
  [RepeatMode.DISABLED]: "Off",
  [RepeatMode.SONG]: "Song",
  [RepeatMode.QUEUE]: "Playlist",
};

const status = (queue) =>
  `Volume: \`${queue.volume}%\` | Filter: \`${
    queue.filters.names.join(", ") || "Off"
  }\` | Repeat: \`${REPEAT_LABELS[queue.repeatMode]}\` | Autoplay: \`${
    queue.autoplay ? "On" : "Off"
  }\``;

// --- Leaving idle voice channels -------------------------------------------
// DisTube 5 no longer leaves on its own, so leave after IDLE_LEAVE_MS when the
// channel has no people in it or nothing is queued.

const idleTimers = new Map();

const hasListeners = (channel) =>
  channel?.members.some((member) => !member.user.bot) ?? false;

function cancelIdleLeave(guildId) {
  clearTimeout(idleTimers.get(guildId));
  idleTimers.delete(guildId);
}

function scheduleIdleLeave(guildId) {
  if (idleTimers.has(guildId)) {
    return;
  }
  idleTimers.set(
    guildId,
    setTimeout(async () => {
      idleTimers.delete(guildId);
      const voice = client.distube.voices.get(guildId);
      const queue = client.distube.getQueue(guildId);
      const empty = !hasListeners(voice?.channel);
      if (!voice || (queue && !empty)) {
        return;
      }

      try {
        if (queue) {
          await queue.stop();
          send(
            queue,
            statusEmbed(
              colors.info,
              "👋 | Left the voice channel because everyone left.",
            ),
          );
        }
        voice.leave();
      } catch (error) {
        logger("Failed to leave idle voice channel:", error);
      }
    }, IDLE_LEAVE_MS),
  );
}

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  const guildId = newState.guild.id;
  const voice = client.distube.voices.get(guildId);
  if (!voice) {
    cancelIdleLeave(guildId);
  } else if (!hasListeners(voice.channel)) {
    scheduleIdleLeave(guildId);
  } else if (client.distube.getQueue(guildId)) {
    cancelIdleLeave(guildId);
  }
});

// --- DisTube events --------------------------------------------------------

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
          { name: "👌 Request by", value: `${song.user ?? "Unknown"}` },
        )
        .setFooter(queueFooter(queue)),
    ),
  )
  .on("addList", (queue, playlist) =>
    send(
      queue,
      new EmbedBuilder()
        .setColor(colors.info)
        .setAuthor({ name: "Added playlist to queue" })
        .setThumbnail(playlist.thumbnail ?? null)
        .setDescription(
          `> [**${playlist.name}**](${playlist.url}) (${playlist.songs.length} songs)`,
        )
        .addFields({
          name: "👌 | Request by",
          value: `${playlist.user ?? "Unknown"}`,
        })
        .setFooter(queueFooter(queue)),
    ),
  )
  .on("playSong", (queue, song) => {
    cancelIdleLeave(queue.id);
    send(
      queue,
      new EmbedBuilder()
        .setColor(colors.success)
        .setAuthor({ name: "Now playing" })
        .setDescription(
          `> [**${song.name}**](${song.url}) \`${song.formattedDuration}\``,
        )
        .setThumbnail(song.thumbnail ?? null)
        .addFields(
          { name: "🔷 | Status", value: status(queue) },
          { name: "👌 | Request by", value: `${song.user ?? "Unknown"}` },
        )
        .setFooter(queueFooter(queue)),
    );
  })
  .on("error", (error, queue) => {
    logger("DisTube error:", error);
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
  .on("disconnect", (queue) => {
    cancelIdleLeave(queue.id);
    send(
      queue,
      statusEmbed(colors.info, "👋 | Disconnected from the voice channel."),
    );
  })
  .on("finish", (queue) => {
    scheduleIdleLeave(queue.id);
    send(
      queue,
      statusEmbed(colors.info, "✅ | Queue finished! Use /play to add more."),
    );
  })
  .on("noRelated", (queue) =>
    send(queue, statusEmbed(colors.error, "🚫 | Song not found!")),
  );
