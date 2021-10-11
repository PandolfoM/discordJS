const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  MessageEmbed,
  MessageAttachment,
  GuildManager,
  Guild,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll a Custom Dice")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("number")
        .setDescription("Question for 8 ball")
        .addNumberOption((option) =>
          option
            .setName("number")
            .setDescription("number limit for roll")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "number") {
      const number = interaction.options.getNumber("number");
      let stringNumber = JSON.stringify(number)
      let roll = JSON.stringify(Math.floor(Math.random() * number));
      const userEmbed = new MessageEmbed()
        .setColor("BLUE")
        .setAuthor(`Custom Dice`)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
        .addFields(
          {
            name: `User:`,
            value: `<@${interaction.user.id}>`,
          },
          {
            name: `Max:`,
            value: stringNumber,
          },
          {
            name: `Results:`,
            value: `**${roll}**`,
          },
        );

      await interaction.reply({ embeds: [userEmbed] });
    } else {
      await interaction.reply("No sub command used");
    }
  },
};
