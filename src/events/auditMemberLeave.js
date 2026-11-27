const { EmbedBuilder, Events, TimestampStyles, time } = require("discord.js");
const colors = require("../config/colors");
const { auditLog, isLoggedGuild } = require("../utils/auditLog");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member, client) {
    if (!isLoggedGuild(member.guild.id)) {
      return;
    }
    const roles = member.roles?.cache
      .filter((role) => role.id !== member.guild.id)
      .map((role) => `${role}`)
      .join(" ");

    const embed = new EmbedBuilder()
      .setColor(colors.error)
      .setAuthor({
        name: `${member.user.tag} left`,
        iconURL: member.user.displayAvatarURL(),
      })
      .setDescription(`${member}`)
      .setFooter({ text: `User ID: ${member.id}` });
    if (member.joinedAt) {
      embed.addFields({
        name: "Joined",
        value: time(member.joinedAt, TimestampStyles.RelativeTime),
      });
    }
    if (roles) {
      embed.addFields({ name: "Roles", value: roles.slice(0, 1024) });
    }
    await auditLog(client, embed);
  },
};
