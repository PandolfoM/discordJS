const { createAudioResource, getVoiceConnection } = require("@discordjs/voice");
const colors = require("../config/colors");
const { EmbedBuilder } = require("discord.js");
const play = require("play-dl");

async function enqueue(queue, title, url, interaction, client) {
  const track = { title, url };
  queue.queue.push(track);

  if (client.musicQueue.get(interaction.guild.id).playing === true) {
    await interaction.reply({
      embeds: [
        {
          color: colors.info,
          title: `Added ${track.title} to the queue!`,
        },
      ],
    });
  }
}

function getGuildQueue(guildId, client) {
  if (!client.musicQueue.has(guildId)) {
    client.musicQueue.set(guildId, {
      playing: false,
      queue: [],
    });
  }

  return client.musicQueue.get(guildId);
}

async function playTrack(queue, player, connection, interaction, client) {
  const track = queue.queue[0];

  if (!track) {
    return;
  }

  try {
    const stream = await play.stream(track.url, {
      discordPlayerCompatibility: true,
      quality: 2,
      language: "en-US",
    });

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    player.play(resource);
    connection.subscribe(player);

    client.musicQueue.set(interaction.guild.id, {
      playing: true,
      queue: client.musicQueue.get(interaction.guild.id).queue,
    });

    await interaction.reply({
      embeds: [
        {
          color: colors.info,
          title: "Now Playing!",
          description: client.musicQueue.get(interaction.guild.id).queue[0]
            .title,
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
}

async function playNextTrack(guildId, client, interaction, player) {
  const queue = getGuildQueue(guildId, client);

  if (!queue) {
    console.error("No queue found for guild:", guildId);
    return;
  }

  const connection = getVoiceConnection(guildId);

  if (!connection) {
    await interaction.reply("There was an error");
    return;
  }

  // Check if there are tracks in the queue
  if (queue.queue.length > 0) {
    const nextTrack = queue.queue.pop();
    const stream = await play.stream(nextTrack.url, {
      discordPlayerCompatibility: true,
      quality: 2,
      language: "en-US",
    });

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    // Play the next track
    player.play(resource);
    connection.subscribe(player);

    // Inform that the next track is now playing
    const nowPlayingEmbed = new EmbedBuilder()
      .setColor(colors.info)
      .setTitle("Now Playing!")
      .setDescription(`${nextTrack.title}`);

    // Assuming you have access to interaction object
    await interaction.reply({ embeds: [nowPlayingEmbed] });
  } else {
    // No more tracks in the queue, stop playing
    player.stop();
    connection.destroy();

    // Reset the queue and playing state
    client.musicQueue.set(guildId, {
      playing: false,
      queue: [],
    });
  }
}

module.exports = {
  enqueue,
  getGuildQueue,
  playTrack,
  playNextTrack,
};
