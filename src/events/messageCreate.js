module.exports = {
  name: "messageCreate",
  execute(message) {
    if (message.content.toLowerCase().includes("sybau")) {
      message.reply("ciaboo*");
    }
  },
};
