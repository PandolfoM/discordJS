const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  MessageEmbed,
  MessageAttachment,
  GuildManager,
  Guild,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("8 Ball")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("question")
        .setDescription("Question for 8 ball")
        .addStringOption((option) =>
          option.setName("question").setDescription("Question for 8 ball")
        )
    ),
  async execute(interaction, option) {
    if (interaction.options.getSubcommand() === "question") {
      const question = interaction.options.getString("question");
      const userEmbed = new MessageEmbed()
        .setColor("BLUE")
        .setAuthor(`8 Ball`)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
        .addFields(
          {
            name: `User:`,
            value: `<@${interaction.user.id}>`,
          },
          {
            name: `Question:`,
            value: question,
          },
          {
            name: `Results:`,
            value: calculateSus(),
          }
        );

      await interaction.reply({ embeds: [userEmbed] });
    } else {
      await interaction.reply("No sub command used");
    }
  },
};

function calculateSus(user) {
  let answers = [
    "Yes",
    "100%",
    "Without a doubt",
    "Yes - definitely",
    "The force is clouded",
    "idk",
    "Ask again later",
    "See clearly I cannot",
    "N <:omegalul:895752102440235100>",
    "Nope",
    "Not a chance",
    "Not a chance",
  ];
  let rng = answers[Math.floor(Math.random() * answers.length)];

  return `**${rng}**`;
}
