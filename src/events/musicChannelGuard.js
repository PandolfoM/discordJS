const { Events, PermissionFlagsBits } = require("discord.js");

/**
 * Keeps the music channel commands-only: deletes regular messages posted in
 * MUSIC_CHANNEL_ID. Slash commands aren't messages, so they're unaffected.
 * Bots and members with Manage Messages (mods/admins) can still post.
 */
module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    const musicChannelId = process.env.MUSIC_CHANNEL_ID;
    if (
      !musicChannelId ||
      message.channelId !== musicChannelId ||
      message.author.bot ||
      message.system ||
      message.member?.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return;
    }

    if (message.deletable) {
      await message.delete();
    }
  },
};
