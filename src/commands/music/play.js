const {
  // StreamType,
  createAudioPlayer,
  joinVoiceChannel,
  createAudioResource,
} = require("@discordjs/voice");
const play = require("play-dl");
const { SlashCommandBuilder } = require("discord.js");
// const ytdl = require("ytdl-core");
// const fetch = require("isomorphic-unfetch");
// const { google } = require("googleapis");
// const { getPreview } = require("spotify-url-info")(fetch);
// const soundcloud = require("soundcloud-downloader").default;

const validUrls = ["youtu.be", "youtube.com", "soundcloud.com"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Jammies")
    .addStringOption((option) =>
      option.setName("url").setRequired(true).setDescription("Link")
    ),
  async execute(interaction, client) {
    const url = interaction.options.getString("url");
    const guildid = interaction.guild.id;
    const channel = interaction.member?.voice.channel;
    const player = createAudioPlayer();

    client.player.set(guildid, player);

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
          // } else if (url.includes("soundcloud.com")) {
          //   await playSoundcloud(url, player, connection, interaction);
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
  const stream = await play.stream(url, {
    discordPlayerCompatibility: true,
    quality: 2,
    language: "en-US",
  });

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
  });

  player.play(resource);
  connection.subscribe(player);

  await interaction.reply("Playing now!");

  ///! Leaving this in just incase play-dl goes down for some reason (Uncomment/comment import) !///

  // const stream = await ytdl(url, { filter: "audioonly" });

  // const resource = createAudioResource(stream, {
  //   inputType: StreamType.Arbitrary,
  // });

  // player.play(resource);
  // connection.subscribe(player);

  // await interaction.reply("Playing now!");
}

///! Leaving this in just incase play-dl goes down for some reason (Uncomment/comment import) !///
// async function playSoundcloud(url, player, connection, interaction) {
//   soundcloud.download(url).then((stream) => {
//     const resource = createAudioResource(stream, {
//       inputType: StreamType.Arbitrary,
//     });
//     player.play(resource);
//     connection.subscribe(player);
//   });

//   await interaction.reply("Playing now!");
// }

async function playSpotify(url, player, connection, interaction) {
  await play.setToken({
    spotify: {
      client_id: process.env.PLAYCLIENTID,
      client_secret: process.env.PLAYCLIENTSECRET,
      refresh_token: process.env.REFRESHTOKEN,
      market: "US",
    },
  });

  if (play.is_expired()) {
    await play.refreshToken();
  }

  const data = await play.spotify(url);

  const searched = await play.search(`${data.name}`, {
    limit: 1,
  });

  const stream = await play.stream(searched[0].url, {
    discordPlayerCompatibility: true,
    quality: 2,
    language: "en-US",
  });

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
  });

  player.play(resource);
  connection.subscribe(player);

  await interaction.reply("Playing spotify now!");

  ///! Leaving this in just incase play-dl goes down for some reason (Uncomment/comment import) !///

  // const trackInfo = await getPreview(url);

  // if (trackInfo?.title && trackInfo?.artist) {
  //   const ytSearch = await searchYouTube(
  //     `${trackInfo.artist} ${trackInfo.title}`
  //   );

  //   const stream = await ytdl(ytSearch, { filter: "audioonly" });

  //   const resource = createAudioResource(stream, {
  //     inputType: StreamType.Arbitrary,
  //   });

  //   player.play(resource);
  //   connection.subscribe(player);

  //   await interaction.reply("Playing Spotify now!");
  // } else {
  //   await interaction.reply("Failed to retrieve Spotify audio preview.");
  // }
}

// async function searchYouTube(query) {
//   const youtube = google.youtube({
//     version: "v3",
//     auth: process.env.YOUTUBEAPIKEY,
//   });

//   try {
//     const response = await youtube.search.list({
//       part: "snippet",
//       q: query,
//       type: "video",
//     });

//     const videoId = response.data.items[0].id.videoId;
//     const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

//     return videoUrl;
//   } catch (error) {
//     console.error("Error searching YouTube:", error.message);
//     return null;
//   }
// }
