const { DisTube } = require("distube");
const { client } = require("../bot");
const { EmbedBuilder } = require("discord.js");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YouTubePlugin } = require("@distube/youtube");
const { AppleMusicPlugin } = require("distube-apple-music");
const colors = require("../config/colors");
const ffmpegPath = require("ffmpeg-static");
require("dotenv").config();

const Format = Intl.NumberFormat();

client.distube = new DisTube(client, {
  ffmpeg: {
    path: ffmpegPath,
  },
  nsfw: true,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: true,
  emitAddListWhenCreatingQueue: true,
  plugins: [
    new SpotifyPlugin({
      api: {
        clientId: process.env.SPOTIFTYCLIENTID,
        clientSecret: process.env.SPOTIFTYCLIENTSECRET,
        topTracksCountry: "US",
      },
    }),
    new SoundCloudPlugin(),
    new YouTubePlugin(),
    new AppleMusicPlugin(),
  ],
});

const status = (queue) =>
  `Volume: \`${queue.volume}%\` | Filter: \`${
    queue.filters.names.join(", ") || "Off"
  }\` | Repeat: \`${
    queue.repeatMode ? (queue.repeatMode === 2 ? "Playlist" : "Song") : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

client.distube.on("addSong", async (queue, song) => {
  await queue.textChannel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(colors.info)
        .setAuthor({
          name: "Added song to queue",
        })
        .setDescription(`> [**${song.name}**](${song.url})`)
        // .setThumbnail(song.user.displayAvatarURL())
        .addFields([
          {
            name: "⏱️ Time",
            value: `${song.formattedDuration}`,
            inline: true,
          },
          {
            name: "🎵 By",
            value: `[${song.uploader.name}](${song.uploader.url})`,
            inline: true,
          },
          {
            name: "👌 Request by",
            value: `${song.user}`,
            inline: true,
          },
        ])
        .setImage(song.thumbnail)
        .setFooter({
          text: `${Format.format(queue.songs.length)} songs in queue`,
        }),
    ],
  });
});

client.distube.on("addList", async (queue, playlist) => {
  await queue.textChannel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(colors.info)
        .setAuthor({
          name: "Add playlist to queue",
        })
        // .setThumbnail(playlist.user.displayAvatarURL())
        .setDescription(`> [**${playlist.name}**](${playlist.url})`)
        .addFields([
          {
            name: "⏱️ | Time",
            value: `${playlist.formattedDuration}`,
            inline: true,
          },
          {
            name: "👌 | Request by",
            value: `${playlist.user}`,
            inline: true,
          },
        ])
        .setImage(playlist.thumbnail)
        .setFooter({
          text: `${Format.format(queue.songs.length)} songs in queue`,
        }),
    ],
  });
});

client.distube.on("playSong", async (queue, song) => {
  await queue.textChannel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(colors.success)
        .setAuthor({
          name: "Now playing",
        })
        .setDescription(`> [**${song.name}**](${song.url})`)
        // .setThumbnail(song.user.displayAvatarURL())
        .addFields([
          {
            name: "🔷 | Status",
            value: `${status(queue).toString()}`,
            inline: false,
          },
          {
            name: "👀 | Views",
            value: `${Format.format(song.views)}`,
            inline: true,
          },
          {
            name: "👍 | Likes",
            value: `${Format.format(song.likes)}`,
            inline: true,
          },
          {
            name: "⏱️ | Time",
            value: `${song.formattedDuration}`,
            inline: true,
          },
          {
            name: "👌 | Request by",
            value: `${song.user}`,
            inline: true,
          },
          {
            name: "📻 | Play music at",
            value: `
┕🔊 | ${client.channels.cache.get(queue.voiceChannel.id)}
┕🪄 | ${queue.voiceChannel.bitrate / 1000}  kbps`,
            inline: false,
          },
        ])
        .setImage(song.thumbnail)
        .setFooter({
          text: `${Format.format(queue.songs.length)} songs in queue`,
        }),
    ],
  });
});

client.distube.on("empty", async (queue) => {
  await queue.textChannel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(colors.error)
        .setDescription(
          `🚫 | The room is empty, the bot automatically leaves the room!`
        ),
    ],
  });
});

client.distube.on("error", async (error, channel) => {
  const channelId = client.channels.cache.get(channel.textChannel.id);
  await channelId.send({
    embeds: [
      new EmbedBuilder()
        .setColor(colors.error)
        .setDescription(
          `🚫 | An error has occurred!\n\n** ${error
            .toString()
            .slice(0, 1974)}**`
        ),
    ],
  });
});

client.distube.on("disconnect", async (queue) => {
  await queue.textChannel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(colors.error)
        .setDescription(
          `🚫 | The bot has disconnected from the voice channel!`
        ),
    ],
  });
});

client.distube.on("finish", async (queue) => {
  queue.stop();
  await queue.textChannel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(colors.error)
        .setDescription(`🚫 | All songs on the playlist have been played!`),
    ],
  });
});

client.distube.on("initQueue", async (queue) => {
  queue.autoplay = false;
  queue.volume = 20;
});

client.distube.on("noRelated", async (queue) => {
  await queue.textChannel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(colors.error)
        .setDescription(`🚫 | Song not found!`),
    ],
    ephemeral: true,
  });
});
