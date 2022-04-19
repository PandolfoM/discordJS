module.exports = {
  name: "messageDelete",
  async execute(message, client) {
    if (message.author.bot || !message.content) {
      console.log(message.author);
      console.log(message.content);
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
