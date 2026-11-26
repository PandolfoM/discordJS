const { Events } = require("discord.js");

module.exports = {
  name: Events.MessageDelete,
  execute(message, client) {
    // Uncached (partial) messages have no author/content to snipe.
    // The music channel is commands-only; its deletions are the guard's, not snipeable.
    if (
      !message.author ||
      message.author.bot ||
      message.channelId === process.env.MUSIC_CHANNEL_ID
    ) {
      return;
    }

    client.snipes.set(message.channelId, {
      content: message.content ?? "",
      img: message.attachments.first()?.url ?? "",
      author: message.author,
      timestamp: message.createdAt,
    });
  },
};
