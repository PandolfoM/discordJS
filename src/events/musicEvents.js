const { MessageEmbed, Options } = require("discord.js");
const music = require("@koenie06/discord.js-music");
const events = music.event;
const { client } = require("../bot");

function YouTubeGetID(url) {
  url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return undefined !== url[2] ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}

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

  channel.send({
    content: `Started playing the song [${songInfo.title}](${songInfo.url}) by \`${songInfo.author}\` of the playlist ${playlist.title}.
        This was requested by ${requester.tag} (${requester.id})`,
  });
});

events.on("addList", async (channel, playlist, requester) => {
  /* See all the 'playlist' options by logging it.. */

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
