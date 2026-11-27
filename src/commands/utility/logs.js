const {
  ChannelType,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require("discord.js");
const colors = require("../../config/colors");
const {
  LOG_CHANNEL_ID,
  LOG_TYPES,
  logChannelId,
} = require("../../config/channels");
const { getSetting, setSetting } = require("../../utils/settings");

const TYPE_CHOICES = Object.entries(LOG_TYPES).map(([value, name]) => ({
  name,
  value,
}));
const NEEDED = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.EmbedLinks,
];

const reply = (interaction, color, description) =>
  interaction.reply({
    embeds: [new EmbedBuilder().setColor(color).setDescription(description)],
    flags: MessageFlags.Ephemeral,
  });

async function saveChannel(type, channelId) {
  const channels = { ...getSetting("logChannels") };
  if (channelId) {
    channels[type] = channelId;
  } else {
    delete channels[type];
  }
  await setSetting(
    "logChannels",
    Object.keys(channels).length ? channels : undefined,
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Choose which channel each kind of log goes to")
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Send one kind of log to a channel")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Which log")
            .setRequired(true)
            .addChoices(...TYPE_CHOICES),
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Where to send it")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName("show").setDescription("Show where each log goes"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("reset")
        .setDescription("Send a log back to the default log channel")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Which log")
            .setRequired(true)
            .addChoices(...TYPE_CHOICES),
        ),
    )
    // Logs include deleted messages and error details.
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "show") {
      const lines = Object.entries(LOG_TYPES).map(([type, label]) => {
        const id = logChannelId(type);
        return `**${label}:** <#${id}>${id === LOG_CHANNEL_ID ? " (default)" : ""}`;
      });
      return reply(interaction, colors.info, lines.join("\n"));
    }

    const type = interaction.options.getString("type");
    const label = LOG_TYPES[type];
    if (!label) {
      throw new Error(`Unknown log type: ${type}`);
    }

    if (subcommand === "reset") {
      await saveChannel(type, null);
      return reply(
        interaction,
        colors.success,
        `**${label}** now go to <#${LOG_CHANNEL_ID}> (the default).`,
      );
    }

    const channel = interaction.options.getChannel("channel");
    if (channel.guildId !== interaction.guildId) {
      return reply(interaction, colors.error, "Pick a channel in this server.");
    }
    const me = interaction.guild.members.me;
    if (!channel.permissionsFor(me)?.has(NEEDED)) {
      return reply(
        interaction,
        colors.error,
        `I need View Channel, Send Messages and Embed Links in ${channel}.`,
      );
    }

    await saveChannel(type, channel.id);
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setDescription(`📋 **${label}** will be posted here.`),
      ],
    });

    const isPublic = channel
      .permissionsFor(interaction.guild.roles.everyone)
      ?.has(PermissionFlagsBits.ViewChannel);
    await reply(
      interaction,
      colors.success,
      `**${label}** now go to ${channel}.` +
        (isPublic
          ? "\n⚠️ Everyone can see that channel. Logs can include deleted " +
            "messages and error details, so consider making it staff-only."
          : ""),
    );
  },
};
