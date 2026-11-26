const { Events } = require("discord.js");

const BOT_MENTION = "<@600149573872254976>";

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Music channel messages are deleted by musicChannelGuard.js; don't reply to them.
    if (message.author.bot || message.channelId === process.env.MUSIC_CHANNEL_ID) {
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
