const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;

const FRAMES = ["Flipping", "Flipping.", "Flipping..", "Flipping...", "Flipping...."];
const FRAME_DELAY_MS = 500;

module.exports = {
  data: new SlashCommandBuilder().setName("cf").setDescription("Flip a coin"),
  async execute(interaction) {
    await interaction.reply(FRAMES[0]);
    for (const frame of FRAMES.slice(1)) {
      await wait(FRAME_DELAY_MS);
      await interaction.editReply(frame);
    }
    await wait(FRAME_DELAY_MS);
    await interaction.editReply(Math.random() < 0.5 ? "Heads" : "Tails");
  },
};
