const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  MessageEmbed,
  MessageAttachment,
  GuildManager,
  Guild,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite to epicans"),
  async execute(interaction, client) {
    const userEmbed = new MessageEmbed()
        .setColor("BLUE")
        .setAuthor(`Invite ~ ${interaction.guild.name}`)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Here's the invite to the server!\nMay the force be with you... Always.")
        .addFields(
          {
            name: `Server Invite:`,
            value: `**[${interaction.guild.name}](https://discord.gg/JK6RCfwWbC)**`,
          }
        );

    await interaction.reply({ embeds: [userEmbed] });
  },
};
