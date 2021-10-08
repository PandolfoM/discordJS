const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { client } = require('../../bot')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hot")
    .setDescription("Calculates how hot you are"),
  async execute(interaction) {
    await interaction.reply({ content: calculateHot(interaction) });
  },
};

function calculateHot(interaction) {
  
  let rng = Math.floor(Math.random() * 100);
  
  emoji = "💔";
  if (rng > 25) {
    emoji = "❤";
  } else if (rng > 50) {
    emoji = "💖";
  } else if (rng > 75) {
    emoji = "💞";
  }
  // return `${interaction.user.username} is ${rng}% hot ${emoji}`;
}
