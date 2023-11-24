const {
  createAudioPlayer,
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
} = require("@discordjs/voice");
const play = require("play-dl");
const { SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");
const {
  getGuildQueue,
  enqueue,
  playTrack,
  playNextTrack,
  hasDJ,
} = require("../../utils/musicUtils");
const { errorEmbed } = require("../../config/embeds");
const logger = require("../../utils/logger");

const validUrls = ["youtu.be", "youtube.com"];

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
    const queue = getGuildQueue(guildid, client);

    player.on("stateChange", (oldState, newState) => {
      if (newState.status === "idle" && oldState.status !== "idle") {
        playNextTrack(guildid, client, interaction, player);
      }
    });

    client.player.set(guildid, player);

    if (await hasDJ(interaction)) {
      if (channel) {
        try {
          const connection = await joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
          });

          connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
              await Promise.race([
                entersState(
                  connection,
                  VoiceConnectionStatus.Signalling,
                  5_000
                ),
                entersState(
                  connection,
                  VoiceConnectionStatus.Connecting,
                  5_000
                ),
              ]);
              // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
              // Seems to be a real disconnect which SHOULDN'T be recovered from
              connection.destroy();
              client.musicQueue.set(guildid, {
                playing: false,
                queue: [],
              });
            }
          });

          const params = {
            url,
            player,
            connection,
            interaction,
            queue,
            client,
          };

          if (validUrls.some((validUrl) => url.includes(validUrl))) {
            await playYouTube(params);
          } else if (url.includes("open.spotify.com")) {
            await playSpotify(params);
          } else if (url.includes("soundcloud.com")) {
            await playSoundcloud(params);
          } else {
            await interaction.reply({
              content: "Not a valid URL",
              ephemeral: true,
            });
          }
        } catch (error) {
          logger(error);
          await interaction.reply({
            embeds: [
              {
                color: colors.error,
                title: "An error occurred while trying to play the song.",
              },
            ],
          });
        }
      } else {
        await interaction.reply({
          embeds: [
            {
              color: colors.error,
              title: "Join a voice channel and try again",
            },
          ],
        });
      }
    }
  },
};

async function playYouTube(params) {
  const { url, player, connection, interaction, queue, client } = params;
  try {
    const data = await play.video_info(url, {
      discordPlayerCompatibility: true,
      quality: 2,
      language: "en-US",
    });

    enqueue(
      queue,
      `${data.video_details.title}`,
      data.video_details.url,
      interaction,
      client
    );

    if (!queue.playing) {
      playTrack(queue, player, connection, interaction, client);
    }
  } catch (error) {
    logger(error);
    await interaction.reply({ embeds: [errorEmbed] });
  }
}

async function playSoundcloud(params) {
  const { url, player, connection, interaction, queue, client } = params;
  try {
    // if (play.is_expired()) {
    // ! Keep checking this page for developer signups https://soundcloud.com/you/apps ! //
    const newToken = await play.getFreeClientID();
    play.setToken({
      soundcloud: {
        client_id: newToken,
      },
    });
    await play.refreshToken();
    // }

    const data = await play.soundcloud(url, {
      discordPlayerCompatibility: true,
      quality: 2,
      language: "en-US",
    });

    const searched = await play.search(`${data.name}`, {
      limit: 1,
    });

    enqueue(queue, `${data.name}`, searched[0].url, interaction, client);

    if (!queue.playing) {
      playTrack(queue, player, connection, interaction, client);
    }
  } catch (error) {
    logger(error);
    await interaction.reply({ embeds: [errorEmbed] });
  }
}

async function playSpotify(params) {
  const { url, player, connection, interaction, queue, client } = params;
  try {
    if (play.is_expired()) {
      await play.refreshToken();
    }

    await play.setToken({
      spotify: {
        client_id: process.env.PLAYCLIENTID,
        client_secret: process.env.PLAYCLIENTSECRET,
        refresh_token: process.env.REFRESHTOKEN,
        market: "US",
      },
    });

    const data = await play.spotify(url);

    const searched = await play.search(
      `${data.artists[0].name} ${data.name} lyrics`,
      {
        limit: 1,
      }
    );

    enqueue(
      queue,
      `${data.artists[0].name} - ${data.name}`,
      searched[0].url,
      interaction,
      client
    );

    if (!queue.playing) {
      playTrack(queue, player, connection, interaction, client);
    }
  } catch (error) {
    logger(error);
    await interaction.reply({ embeds: [errorEmbed] });
  }
}
