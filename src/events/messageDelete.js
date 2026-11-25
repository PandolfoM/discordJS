const { Events } = require("discord.js");

module.exports = {
  name: Events.MessageDelete,
  execute(message, client) {
    // Uncached (partial) messages have no author/content to snipe.
    if (!message.author || message.author.bot) {
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
