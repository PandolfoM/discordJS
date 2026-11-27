const { EmbedBuilder, Events } = require("discord.js");
const colors = require("../config/colors");
const { auditLog } = require("../utils/auditLog");

const list = (roles) =>
  roles
    .map((role) => `${role}`)
    .join(" ")
    .slice(0, 1024);

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember, client) {
    // Without the old member cached there's nothing to compare against.
    if (oldMember.partial) {
      return;
    }
    const added = newMember.roles.cache.filter(
      (role) => !oldMember.roles.cache.has(role.id),
    );
    const removed = oldMember.roles.cache.filter(
      (role) => !newMember.roles.cache.has(role.id),
    );
    if (!added.size && !removed.size) {
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(colors.info)
      .setAuthor({
        name: `${newMember.user.tag}'s roles changed`,
        iconURL: newMember.user.displayAvatarURL(),
      })
      .setDescription(`${newMember}`)
      .setFooter({ text: `User ID: ${newMember.id}` });
    if (added.size) {
      embed.addFields({ name: "Added", value: list(added) });
    }
    if (removed.size) {
      embed.addFields({ name: "Removed", value: list(removed) });
    }
    await auditLog(client, embed);
  },
};
