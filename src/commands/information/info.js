const { SlashCommandBuilder, time } = require("@discordjs/builders");
const {
  MessageEmbed,
  MessageAttachment,
  GuildManager,
  Guild,
} = require("discord.js");
const dayjs = require("dayjs");
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Info based on user")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Info about a mentioned user")
        .addUserOption((option) =>
          option.setName("target").setDescription("The user mentions")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("server").setDescription("Info about the server")
    ),
  async execute(interaction, client) {
    if (interaction.options.getSubcommand() === "user") {
      const user = interaction.options.getUser("target");

      const timestamp = user.createdTimestamp;
      let date = dayjs(timestamp).format("LLLL");
      if (user) {
        const userEmbed = new MessageEmbed()
          .setColor("BLUE")
          .setAuthor(`User Info ~ ${user.tag}`)
          .setThumbnail(user.avatarURL({ dynamic: true }))
          .addFields(
            {
              name: `ID:`,
              value: `${user.id}`,
            },
            {
              name: `Account Created:`,
              value: `${date}`,
            }
          );

        await interaction.reply({ embeds: [userEmbed] });
      } else {
        await interaction.reply(
          `Username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`
        );
      }
    } else if (interaction.options.getSubcommand() === "server") {
      const timestamp = interaction.guild.createdTimestamp;
      let date = dayjs(timestamp).format("LLLL");
      const userEmbed = new MessageEmbed()
        .setColor("BLUE")
        .setAuthor(`Server Info ~ ${interaction.guild.name}`)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .addFields(
          {
            name: `Created Date:`,
            value: `${date}`,
          },
          {
            name: `Members:`,
            value: `${interaction.guild.memberCount}`,
          }
        );

      await interaction.reply({ embeds: [userEmbed] });
    } else {
      await interaction.reply("No sub command was used");
    }
  },
};
