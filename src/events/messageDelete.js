module.exports = {
  name: "messageDelete",
  async execute(message, client) {
    if (message.author.bot) {
      return;
    }

    const img = message.attachments.values().next().value;

    const snipeData = {
      content: message.content ? message.content : "",
      img: img ? img.url : "",
      author: message.author,
      timestamp: message.createdAt,
    };

    client.snipes.set(message.channel.id, snipeData);
  },
};
