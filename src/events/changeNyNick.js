module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    const newNick = "nydevils";
    const onlyNy =
      message.author.id == "391977387447025664" &&
      message.member.nickname !== newNick;
    if (onlyNy) {
      message.member.setNickname(newNick);
    }
  },
};
