const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("hot")
    .setDescription("Calculates how hot you are")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Calculate how hot another user is")
        .addUserOption((option) =>
          option.setName("target").setDescription("The user mentioned")
        )
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "user") {
      const user = interaction.options.getUser("target");

      if (user) {
        const userEmbed = new MessageEmbed()
          .setColor("BLUE")
          .setAuthor({name: 'Hot Calculator'})
          .setThumbnail(user.avatarURL({ dynamic: true }))
          .addFields(
            {
              name: `User:`,
              value: `<@${user.id}>`,
            },
            {
              name: `Results:`,
              value: calculateHot(user),
            }
          );

        await interaction.reply({ embeds: [userEmbed] });
      } else {
        const userEmbed = new MessageEmbed()
          .setColor("BLUE")
          .setAuthor({name: 'Hot Calculator'})
          .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
          .addFields(
            {
              name: `User:`,
              value: `<@${interaction.user.id}>`,
            },
            {
              name: `Results:`,
              value: calculateHot2(interaction),
            }
          );

        await interaction.reply({ embeds: [userEmbed] });
      }
    } else {
      await interaction.reply("No sub command used");
    }
  },
};

function calculateHot(user) {
  let rng = Math.floor(Math.random() * 100);

  if (rng < 25) {
    var emoji = "💔";
  }
  if (rng > 25) {
    var emoji = "❤";
  }
  if (rng > 50) {
    var emoji = "💖";
  }
  if (rng > 75) {
    var emoji = "💞";
  }
  return `${user.username} is **${rng}%** hot ${emoji}`;
}

function calculateHot2(interaction) {
  let rng = Math.floor(Math.random() * 100);

  if (rng < 25) {
    var emoji = "💔";
  }
  if (rng > 25) {
    var emoji = "❤";
  }
  if (rng > 50) {
    var emoji = "💖";
  }
  if (rng > 75) {
    var emoji = "💞";
  }
  return `${interaction.user.username} is **${rng}%** hot ${emoji}`;
}
