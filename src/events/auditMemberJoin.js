const { EmbedBuilder, Events, TimestampStyles, time } = require("discord.js");
const colors = require("../config/colors");
const { auditLog, isLoggedGuild } = require("../utils/auditLog");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    if (!isLoggedGuild(member.guild.id)) {
      return;
    }
    await auditLog(
      client,
      "members",
      new EmbedBuilder()
        .setColor(colors.success)
        .setAuthor({
          name: `${member.user.tag} joined`,
          iconURL: member.user.displayAvatarURL(),
        })
        .setDescription(`${member}`)
        .addFields({
          name: "Account created",
          value: time(member.user.createdAt, TimestampStyles.RelativeTime),
        })
        .setFooter({ text: `User ID: ${member.id}` }),
    );
  },
};
