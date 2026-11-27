const { EmbedBuilder, Events, TimestampStyles, time } = require("discord.js");
const colors = require("../config/colors");
const { auditLog } = require("../utils/auditLog");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    await auditLog(
      client,
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
