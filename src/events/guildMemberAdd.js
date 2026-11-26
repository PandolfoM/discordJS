const { Events } = require("discord.js");

const PADAWAN_ROLE_ID = "726269144521244683";

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (member.guild.roles.cache.has(PADAWAN_ROLE_ID)) {
      await member.roles.add(PADAWAN_ROLE_ID);
    }
  },
};
