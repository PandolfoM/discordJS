const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  MessageEmbed,
  MessageAttachment,
  GuildManager,
  Guild,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("dice").setDescription("Rolls a dice"),
  async execute(interaction) {
    let sides = ['1','2','3','4','5','6']
    let roll = sides[Math.floor(Math.random() * sides.length)]

    console.log(roll)
    const userEmbed = new MessageEmbed()
        .setColor("BLUE")
        .setAuthor(`Roll Dice`)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
        .addFields(
          {
            name: `User:`,
            value: `<@${interaction.user.id}>`,
          },
          {
            name: `Results:`,
            value: `**${roll}**`,
          }
        );

      await interaction.reply({ embeds: [userEmbed] });
  },
};
