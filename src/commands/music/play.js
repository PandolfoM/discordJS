const {
  createAudioPlayer,
  joinVoiceChannel,
  StreamType,
  createAudioResource,
} = require("@discordjs/voice");
const { SlashCommandBuilder } = require("discord.js");
const ytdl = require("ytdl-core");
const fetch = require("isomorphic-unfetch");
const { google } = require("googleapis");
const { getPreview } = require("spotify-url-info")(fetch);
const soundcloud = require("soundcloud-downloader").default;
const fs = require("fs");

const validUrls = ["youtu.be", "youtube.com"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Jammies")
    .addStringOption((option) =>
      option.setName("url").setRequired(true).setDescription("Link")
    ),
  async execute(interaction) {
    const url = interaction.options.getString("url");
    const channel = interaction.member?.voice.channel;
    const player = createAudioPlayer();

    if (channel) {
      try {
        const connection = await joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guildId,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });

        if (validUrls.some((validUrl) => url.includes(validUrl))) {
          await playYouTube(url, player, connection, interaction);
        } else if (url.includes("open.spotify.com")) {
          await playSpotify(url, player, connection, interaction);
        } else if (url.includes("soundcloud.com")) {
          await playSoundcloud(url, player, connection, interaction);
        } else {
          await interaction.reply({
            content: "Not a valid URL",
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error("Error while playing:", error);
        await interaction.reply(
          "An error occurred while trying to play the song."
        );
      }
    } else {
      await interaction.reply("Join a voice channel then try again!");
    }
  },
};

async function playYouTube(url, player, connection, interaction) {
  const stream = await ytdl(url, { filter: "audioonly" });

  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
  });

  player.play(resource);
  connection.subscribe(player);

  await interaction.reply("Playing now!");
}

async function playSoundcloud(url, player, connection, interaction) {
  soundcloud.download(url).then((stream) => {
    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });
    player.play(resource);
    connection.subscribe(player);
  });

  await interaction.reply("Playing now!");
}

async function playSpotify(url, player, connection, interaction) {
  const trackInfo = await getPreview(url);

  if (trackInfo?.title && trackInfo?.artist) {
    const ytSearch = await searchYouTube(
      `${trackInfo.artist} ${trackInfo.title}`
    );

    const stream = await ytdl(ytSearch, { filter: "audioonly" });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    player.play(resource);
    connection.subscribe(player);

    await interaction.reply("Playing Spotify now!");
  } else {
    await interaction.reply("Failed to retrieve Spotify audio preview.");
  }
}

async function searchYouTube(query) {
  const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBEAPIKEY,
  });

  try {
    const response = await youtube.search.list({
      part: "snippet",
      q: query,
      type: "video",
    });

    const videoId = response.data.items[0].id.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return videoUrl;
  } catch (error) {
    console.error("Error searching YouTube:", error.message);
    return null;
  }
}
