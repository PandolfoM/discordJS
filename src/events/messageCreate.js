module.exports = {
  name: "messageCreate",
  execute(message, client) {
    if (message.content.toLowerCase().includes("sybau")) {
      message.reply("ciaboo*");
    }
  },
};
