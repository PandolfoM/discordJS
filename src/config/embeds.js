const { EmbedBuilder } = require("discord.js");
const colors = require("./colors");

const errorEmbed = new EmbedBuilder()
  .setColor(colors.error)
  .setTitle("There has been an error!");

const noDjEmbed = new EmbedBuilder()
  .setColor(colors.error)
  .setTitle("You are not a DJ!");

/** Small embed with just a colour and a description. */
const statusEmbed = (color, description) =>
  new EmbedBuilder().setColor(color).setDescription(description);

module.exports = {
  errorEmbed,
  noDjEmbed,
  statusEmbed,
};
