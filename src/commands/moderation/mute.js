const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  InteractionContextType,
  MessageFlags,
  time,
  TimestampStyles,
} = require("discord.js");
const colors = require("../../config/colors");
const logger = require("../../utils/logger");

const MAX_TIMEOUT_MINUTES = 28 * 24 * 60; // Discord's limit is 28 days

const replyError = (interaction, title) =>
  interaction.reply({
    embeds: [{ color: colors.error, title }],
    flags: MessageFlags.Ephemeral,
  });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes member")
    .addUserOption((option) =>
      option.setName("target").setRequired(true).setDescription("User to mute"),
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(MAX_TIMEOUT_MINUTES)
        .setDescription("How long to mute user (minutes)"),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for mute"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const member = interaction.options.getMember("target");
    const minutes = interaction.options.getInteger("duration");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!member) {
      return replyError(interaction, "Invalid User");
    }
    if (!member.moderatable) {
      return replyError(interaction, "Not enough permission");
    }

    const duration = minutes * 60 * 1000;
    try {
      await member.timeout(duration, reason);
    } catch (error) {
      logger(error);
      return replyError(interaction, "Not enough permission");
    }

    const muteEnd = Math.floor((Date.now() + duration) / 1000);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${member.user.username} has been muted`)
          .setThumbnail(member.displayAvatarURL())
          .setColor(colors.info)
          .addFields(
            { name: "Duration of timeout:", value: `${minutes} Minute(s)` },
            { name: "Mute until:", value: time(muteEnd, TimestampStyles.LongTime) },
            { name: "Reason:", value: reason.slice(0, 1024) },
          )
          .setTimestamp(),
      ],
    });
  },
};
