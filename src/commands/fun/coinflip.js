const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder().setName("cf").setDescription("Flips a coin"),
  async execute(interaction) {
    coinFlip()
    await interaction.reply({ content: coinFlip() })
  }
};

function coinFlip() {
  let math = Math.floor(Math.random()* 2);
  if (math === 1) {
    return "Heads"
  } else {
    return "Tails"
  }
}