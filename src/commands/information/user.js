const {
  SlashCommandBuilder,
  EmbedBuilder,
  InteractionContextType,
  time,
  TimestampStyles,
} = require("discord.js");
const colors = require("../../config/colors");

const fullDate = (timestamp) =>
  time(Math.floor(timestamp / 1000), TimestampStyles.LongDateTime);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Info based on user")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Info about a mentioned user")
        .addUserOption((option) =>
          option.setName("target").setDescription("The user mentions"),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("server").setDescription("Info about the server"),
    )
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const { guild } = interaction;

    if (interaction.options.getSubcommand() === "server") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.info)
            .setAuthor({ name: `Server Info ~ ${guild.name}` })
            .setThumbnail(guild.iconURL())
            .addFields(
              {
                name: "Created Date:",
                value: fullDate(guild.createdTimestamp),
              },
              { name: "Members:", value: `${guild.memberCount}` },
            ),
        ],
      });
    }

    const target = interaction.options.getUser("target");
    const user = target ?? interaction.user;
    const member = target
      ? interaction.options.getMember("target")
      : interaction.member;
    const isOwner = guild.ownerId === user.id;

    const embed = new EmbedBuilder()
      .setColor(colors.info)
      .setAuthor({
        name: `User Info ~ ${user.username}${isOwner ? " 👑" : ""}`,
      })
      .setThumbnail(user.displayAvatarURL())
      .addFields({ name: "ID:", value: user.id })
      .setTimestamp();

    if (member?.joinedTimestamp) {
      embed.addFields({
        name: `Joined ${guild.name}:`,
        value: fullDate(member.joinedTimestamp),
      });
    }
    embed.addFields({
      name: "Account Created:",
      value: fullDate(user.createdTimestamp),
    });

    if (member?.nickname) {
      embed.setDescription(`AKA: ${member.nickname}`);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
