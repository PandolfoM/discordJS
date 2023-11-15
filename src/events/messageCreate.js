module.exports = {
  name: "messageCreate",
  execute(message) {
    console.log(message.content);
    if (message.content.toLowerCase().includes("sybau")) {
      message.reply("ciaboo*");
    }
    if (message.content.toLowerCase() === "<@600149573872254976>") {
      message.reply("What you want bitch");
    }
  },
};
