const { Events } = require("discord.js");

const BOT_MENTION = "<@600149573872254976>";

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) {
      return;
    }

    const content = message.content.toLowerCase();
    if (content.includes("sybau")) {
      await message.reply("ciaboo*");
    }
    if (content === BOT_MENTION) {
      await message.reply("What you want bitch");
    }
  },
};
