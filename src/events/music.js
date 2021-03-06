const { MessageEmbed, Options } = require("discord.js");
const music = require("@koenie06/discord.js-music");
const events = music.event;
const { client } = require("../bot");

events.on("playSong", async (channel, songInfo, requester) => {
  /* See all the 'songInfo' options by logging it.. */
  let url = songInfo.url;
  url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  const playEmbed = new MessageEmbed()
    .setColor("BLUE")
    .setTitle("Now Playing!")
    .setDescription(`Requested by: ${requester.username}`)
    .setAuthor(client.user.username, client.user.avatarURL({ dynamic: true }))
    .setThumbnail(requester.avatarURL({ dynamic: true }))
    .addField(
      `${songInfo.title} by ${songInfo.author}`,
      `${songInfo.url}`,
      false
    )
    .setImage(`https://img.youtube.com/vi/${url[2]}/0.jpg`);
  channel.send({ embeds: [playEmbed] });
});

events.on("addSong", async (channel, songInfo, requester) => {
  /* See all the 'songInfo' options by logging it.. */
  const addEmbed = {
    color: "BLUE",
    title: "Added Song",
    description: `Requested by: ${requester.username}`,
    author: {
      name: client.user.username,
      icon_url: client.user.avatarURL({ dynamic: true }),
    },
    thumbnail: {
      url: requester.avatarURL({ dynamic: true }),
    },
    fields: [
      {
        name: `${songInfo.title} by ${songInfo.author}`,
        value: songInfo.url,
        inline: false,
      },
    ],
  };
  channel.send({ embeds: [addEmbed] });
});

events.on("playList", async (channel, playlist, songInfo, requester) => {
  /* See all the 'songInfo' and 'playlist' options by logging it.. */

  const playlistEmbed = {
    color: "BLUE",
    title: "Started Playing Song",
    description: `Requested by: ${requester.username}`,
    author: {
      name: client.user.username,
      icon_url: client.user.avatarURL({ dynamic: true }),
    },
    thumbnail: {
      url: requester.avatarURL({ dynamic: true }),
    },
    fields: [
      {
        name: `${songInfo.title} by ${songInfo.author}`,
        value: songInfo.url,
        inline: false,
      },
    ],
  };
  channel.send({ embeds: [playlistEmbed] });
});

events.on("addList", async (channel, playlist, requester) => {
  /* See all the 'playlist' options by logging it.. */

  const listEmbed = {
    color: "BLUE",
    title: "Added Playlist",
    description: `Added by: ${requester.username}`,
    author: {
      name: client.user.username,
      icon_url: client.user.avatarURL({ dynamic: true }),
    },
    thumbnail: {
      url: requester.avatarURL({ dynamic: true }),
    },
    fields: [
      {
        name: `${playlist.title} with ${playlist.videos.length} videos`,
        value: playlist.url,
        inline: false,
      },
    ],
  };
  channel.send({ embeds: [listEmbed] });

  channel.send({
    content: `Added the playlist [${playlist.title}](${playlist.url}) with ${playlist.videos.length} amount of videos to the queue.
        Added by ${requester.tag} (${requester.id})`,
  });
});

events.on("finish", async (channel) => {
  channel.send({
    content: "Party has been ended!",
  });
});
