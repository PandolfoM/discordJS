module.exports = {
  name: "messageCreate",
  execute(message, client) {
    if (message.content.toLowerCase().includes("sybau")) {
      message.reply("ciaboo*");
    } else if (message.content.includes("https://www.facebook.com/marketplace")) {
      message.reply("<:batChest:899088881243283466>")
    }
    // else if (message.content.includes("<@248910149442338816>")) {
    //   message.reply('STFU RETARD + RATIO')
    // }
  },
};
