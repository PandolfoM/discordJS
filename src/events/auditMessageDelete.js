const { EmbedBuilder, Events } = require("discord.js");
const colors = require("../config/colors");
const { auditLog, isLoggedChannel, plainText } = require("../utils/auditLog");

module.exports = {
  name: Events.MessageDelete,
  async execute(message, client) {
    // Uncached messages have no author or content to show.
    if (!message.author || message.author.bot || !isLoggedChannel(message)) {
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(colors.error)
      .setAuthor({
        name: `${message.author.tag} deleted a message`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setDescription(`In ${message.channel}`)
      .addFields({ name: "Message", value: plainText(message.content) });
    if (message.attachments.size) {
      embed.addFields({
        name: "Attachments",
        value: plainText(message.attachments.map((a) => a.name).join(", ")),
      });
    }
    embed.setFooter({ text: `User ID: ${message.author.id}` });
    await auditLog(client, "messages", embed);
  },
};
