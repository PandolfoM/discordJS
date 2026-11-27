const { EmbedBuilder, Events } = require("discord.js");
const colors = require("../config/colors");
const { auditLog, isLoggedChannel, plainText } = require("../utils/auditLog");

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage, client) {
    // Skip uncached messages and updates that didn't change the text (e.g. a
    // link preview loading).
    if (
      oldMessage.partial ||
      !newMessage.author ||
      newMessage.author.bot ||
      oldMessage.content === newMessage.content ||
      !isLoggedChannel(newMessage)
    ) {
      return;
    }

    await auditLog(
      client,
      new EmbedBuilder()
        .setColor(colors.info)
        .setAuthor({
          name: `${newMessage.author.tag} edited a message`,
          iconURL: newMessage.author.displayAvatarURL(),
        })
        .setDescription(
          `In ${newMessage.channel} · [Jump to message](${newMessage.url})`,
        )
        .addFields(
          { name: "Before", value: plainText(oldMessage.content) },
          { name: "After", value: plainText(newMessage.content) },
        )
        .setFooter({ text: `User ID: ${newMessage.author.id}` }),
    );
  },
};
