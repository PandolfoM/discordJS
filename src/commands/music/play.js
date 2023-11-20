const {
  createAudioPlayer,
  joinVoiceChannel,
  createAudioResource,
} = require("@discordjs/voice");
const play = require("play-dl");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const colors = require("../../config/colors");

const validUrls = ["youtu.be", "youtube.com"];

const errorEmbed = new EmbedBuilder()
  .setColor(colors.error)
  .setTitle("There has been an error!");

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
  try {
    const data = await play.video_info(url, {
      discordPlayerCompatibility: true,
      quality: 2,
      language: "en-US",
    });
    const stream = await play.stream_from_info(data);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    player.play(resource);
    connection.subscribe(player);

    await interaction.reply({
      embeds: [
        {
          color: colors.info,
          title: "Now Playing!",
          description: `${data.video_details.title}`,
        },
      ],
    });
  } catch (error) {
    await interaction.reply({ embeds: [errorEmbed] });
  }
}

async function playSoundcloud(url, player, connection, interaction) {
  try {
    if (play.is_expired()) {
      // ! Keep checking this page for developer signups https://soundcloud.com/you/apps ! //
      const newToken = await play.getFreeClientID();
      play.setToken({
        soundcloud: {
          client_id: newToken,
        },
      });
      await play.refreshToken();
    }

    const data = await play.soundcloud(url, {
      discordPlayerCompatibility: true,
      quality: 2,
      language: "en-US",
    });
    const stream = await play.stream_from_info(data);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    player.play(resource);
    connection.subscribe(player);

    await interaction.reply({
      embeds: [
        {
          color: colors.info,
          title: "Now Playing!",
          description: `${data.publisher.artist} - ${data.name}`,
        },
      ],
    });
  } catch (error) {
    await interaction.reply({ embeds: [errorEmbed] });
  }
}

async function playSpotify(url, player, connection, interaction) {
  try {
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

    await interaction.reply({
      embeds: [
        {
          color: colors.info,
          title: "Now Playing!",
          description: `${data.artists[0].name} - ${data.name}`,
        },
      ],
    });
  } catch (error) {
    await interaction.reply({ embeds: [errorEmbed] });
  }
}
