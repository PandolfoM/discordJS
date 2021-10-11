const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  MessageEmbed,
  MessageAttachment,
  GuildManager,
  Guild,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mjp")
    .setDescription("MJP Games Socials"),
  async execute(interaction, client) {
    const userEmbed = new MessageEmbed()
        .setColor("BLUE")
        .setAuthor(`MJP Games`)
        .setThumbnail('https://i.imgur.com/Oiegv00.png')
        .setDescription("Social links for MJP Games")
        .setImage('https://i.imgur.com/kkI9gfq.png')
        .addFields(
          {
            name: `YouTube:`,
            value: `**[YouTube](https://www.youtube.com/mjpgames)**`,
          },
          {
            name: `Twitter:`,
            value: `**[Twitter](https://twitter.com/Mjpgames)**`,
          },
          {
            name: `Twitch:`,
            value: `**[Twitch](https://www.twitch.tv/mjp_games)**`,
          }
        );

    await interaction.reply({ embeds: [userEmbed] });
  },
};
