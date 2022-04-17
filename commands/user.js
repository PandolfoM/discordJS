const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
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
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "user") {
      const user = interaction.options.getUser("target");

      const accCreated = user.createdTimestamp;
      const accJoined = interaction.member.guild.joinedTimestamp
      let date = dayjs(accCreated).format("LLLL");
      let dateJoined = dayjs(accJoined).format("LLLL");
      let isOwner = interaction.member.guild.ownerId === user.id;
      if (user) {
        const userEmbed = new MessageEmbed()
          .setColor("BLUE")
          .setThumbnail(user.avatarURL({ dynamic: true }))
          .addFields(
            {
              name: `ID:`,
              value: `${user.id}`,
            },
            {
              name: `Joined ${interaction.member.guild.name}:`,
              value: `${dateJoined}`,
            },
            {
              name: `Account Created:`,
              value: `${date}`,
            }
          )
          .setTimestamp();

        if (interaction.member.nickname) {
          userEmbed.setDescription(`AKA: ${interaction.member.nickname}`);
        }

        if (isOwner) {
          userEmbed.setAuthor(`User Info ~ ${user.tag} 👑`)
        } else {
          userEmbed.setAuthor(`User Info ~ ${user.tag}`)
        }

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
