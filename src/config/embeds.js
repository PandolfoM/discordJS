const { EmbedBuilder } = require("discord.js");
const colors = require("./colors");

const errorEmbed = new EmbedBuilder()
  .setColor(colors.error)
  .setTitle("There has been an error!");

module.exports = {
  errorEmbed,
};
