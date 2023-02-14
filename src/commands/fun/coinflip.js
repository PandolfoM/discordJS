const { SlashCommandBuilder } = require("@discordjs/builders");
const wait = require("node:timers/promises").setTimeout;

module.exports = {
  data: new SlashCommandBuilder().setName("cf").setDescription("Flip a coin"),
  async execute(interaction) {
    await interaction.reply("Flipping");
    await wait(500);
    await interaction.editReply("Flipping.");
    await wait(500);
    await interaction.editReply("Flipping..");
    await wait(500);
    await interaction.editReply("Flipping...");
    await wait(500);
    await interaction.editReply("Flipping....");
    await wait(500);
    coinFlip();
    await interaction.editReply({ content: coinFlip() });
  },
};

function coinFlip() {
  let math = Math.floor(Math.random() * 2);
  if (math === 1) {
    return "Heads";
  } else {
    return "Tails";
  }
}
