const { Events } = require("discord.js");

const NY_USER_ID = "391977387447025664";
const NICKNAME = "nydevils";

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    const { member } = message;
    if (
      message.author.id !== NY_USER_ID ||
      !member ||
      member.nickname === NICKNAME ||
      !member.manageable
    ) {
      return;
    }
    await member.setNickname(NICKNAME);
  },
};
