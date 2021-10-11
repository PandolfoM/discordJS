const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  MessageEmbed,
  MessageAttachment,
  GuildManager,
  Guild,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("height")
    .setDescription("Calculates your height")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Calculate how tall another user is")
        .addUserOption((option) =>
          option.setName("target").setDescription("The user mentioned")
        )
    ),
  async execute(interaction, client) {
    if (interaction.options.getSubcommand() === "user") {
      const user = interaction.options.getUser("target");

      if (user) {
        const userEmbed = new MessageEmbed()
          .setColor("BLUE")
          .setAuthor(`Height Calculator`)
          .setThumbnail(user.avatarURL({ dynamic: true }))
          .addFields(
            {
              name: `User:`,
              value: `<@${user.id}>`,
            },
            {
              name: `Results:`,
              value: calculateSus(user),
            }
          );

        await interaction.reply({ embeds: [userEmbed] });
      } else {
        const userEmbed = new MessageEmbed()
          .setColor("BLUE")
          .setAuthor(`Height Calculator`)
          .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
          .addFields(
            {
              name: `User:`,
              value: `<@${interaction.user.id}>`,
            },
            {
              name: `Results:`,
              value: calculateSus2(interaction),
            }
          );

        await interaction.reply({ embeds: [userEmbed] });
      }
    } else {
      await interaction.reply("No sub command used");
    }
  },
};

function calculateSus(user) {
  let height = ["4","4'1","4'2","4'3","4'4","4'5","4'6","4'7","4'8","4'9","4'10","4'11","5","5'1","5'2","5'3","5'4","5'5","5'6","5'7","5'8","5'9","5'10","5'11","6","6'1","6'2","6'3","6'4","6'5","6'6","6'7","6'8","6'9","6'10","6'11","7"];
  let rng = height[Math.floor(Math.random() * height.length)];

  return `${user.username} is **${rng}**`;
}

function calculateSus2(interaction) {
  let height = ["4","4'1","4'2","4'3","4'4","4'5","4'6","4'7","4'8","4'9","4'10","4'11","5","5'1","5'2","5'3","5'4","5'5","5'6","5'7","5'8","5'9","5'10","5'11","6","6'1","6'2","6'3","6'4","6'5","6'6","6'7","6'8","6'9","6'10","6'11","7"];
  let rng = height[Math.floor(Math.random() * height.length)];
  

  return `${interaction.user.username} is **${rng}**`;
}
