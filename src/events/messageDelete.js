module.exports = {
  name: "messageDelete",
  async execute(message, client) {
    if (message.author.bot) {
      return;
    }

    const img = message.attachments.values().next().value;

    const snipeData = {
      content: img ? img.url : message.content,
      author: message.author,
      timestamp: message.createdAt,
    };

    client.snipes.set(message.channel.id, snipeData);
  },
};
