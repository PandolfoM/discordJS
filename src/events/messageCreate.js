module.exports = {
  name: "messageCreate",
  execute(message, client) {
    if (message.content.toLowerCase() == "sybau") {
      message.reply("ciaboo*");
    }
    else if (message.content.includes("<@248910149442338816>")) {
      message.reply('STFU RETARD + RATIO')
    }
  },
};
