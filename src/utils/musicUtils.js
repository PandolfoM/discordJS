const { MessageFlags } = require("discord.js");
const colors = require("../config/colors");
const { noDjEmbed, statusEmbed } = require("../config/embeds");

/** Replies (or edits a deferred reply) with an error embed. */
function replyError(interaction, description) {
  const embeds = [statusEmbed(colors.error, `🚫 | ${description}`)];
  return interaction.deferred || interaction.replied
    ? interaction.editReply({ embeds })
    : interaction.reply({ embeds, flags: MessageFlags.Ephemeral });
}

/**
 * Checks the music channel + DJ role from .env (MUSIC_CHANNEL_ID, DEV_CHANNEL_ID,
 * DJ_ROLE_ID; leave one unset to disable that restriction). Replies and returns
 * false if denied.
 */
async function hasDJ(interaction) {
  const {
    DEV_CHANNEL_ID: devChannel,
    MUSIC_CHANNEL_ID: musicChannel,
    DJ_ROLE_ID: djRole,
  } = process.env;

  const inAllowedChannel =
    !musicChannel || [devChannel, musicChannel].includes(interaction.channelId);

  if (!inAllowedChannel) {
    await interaction.reply({
      embeds: [
        statusEmbed(colors.error, `Type in <#${musicChannel}> to play music`),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  if (!djRole || interaction.member.roles.cache.has(djRole)) {
    return true;
  }

  await interaction.reply({
    embeds: [noDjEmbed],
    flags: MessageFlags.Ephemeral,
  });
  return false;
}

/**
 * Validates a music command: the member is in a voice channel (the bot's, when
 * a queue exists), a queue exists if required, and the member passes the DJ /
 * music channel check if required. Replies with an error and returns null
 * when invalid.
 */
async function ensureVoice(
  interaction,
  client,
  { requireQueue = true, requireDJ = true } = {},
) {
  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    await replyError(
      interaction,
      "You must be in a voice channel to use this command!",
    );
    return null;
  }

  const queue = client.distube.getQueue(interaction.guildId);
  if (requireQueue && !queue) {
    await replyError(interaction, "There is nothing playing!");
    return null;
  }

  const botChannelId = interaction.guild.members.me.voice.channelId;
  if (queue && botChannelId && botChannelId !== voiceChannel.id) {
    await replyError(
      interaction,
      "You need to be on the same voice channel as the Bot!",
    );
    return null;
  }

  if (requireDJ && !(await hasDJ(interaction))) {
    return null;
  }

  return { voiceChannel, queue };
}

module.exports = {
  ensureVoice,
  hasDJ,
  replyError,
};
