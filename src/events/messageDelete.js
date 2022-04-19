module.exports = {
  name: "messageDelete",
  async execute(message, client) {
    if (message.author.bot || !message.content) {
      return;
    } else {
      client.snipes.set(message.channel.id, {
        content: message.content,
        author: message.author,
        timestamp: message.createdAt,
      });
    }
  },
};
