const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const Character = require("../../schemas/characters");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sw")
    .setDescription("Search the library for Star Wars information")
    .addStringOption((option) =>
      option
        .setName("character")
        .setRequired(true)
        .setDescription("Find information of character")
    ),
  async execute(interaction, client) {
    let character = interaction.options.getString("character").toLowerCase();
    const characterProfile = await client.findInfo(
      interaction.member,
      character
    );
    if (!characterProfile) {
      await interaction.reply({ content: "No character found!" });
    } else {
      const embed = new MessageEmbed()
        .setColor(characterProfile.color)
        .setTitle("Star Wars Holocron")
        .setThumbnail("https://i.imgur.com/0y2H5wR.png")
        .setImage(characterProfile.img)
        .addFields(
          {
            name: `Name:`,
            value: `${capitalize(characterProfile.fname)} ${capitalize(
              characterProfile.lname
            )}`,
          },
          {
            name: `Weapon:`,
            value: `${capitalize(characterProfile.weapon)}`,
          },
          {
            name: `Species:`,
            value: `${capitalize(characterProfile.species)}`,
          },
          {
            name: `Fact:`,
            value: `${capitalize(characterProfile.fact)}`,
          },
          {
            name: `Quote:`,
            value: `${capitalize(characterProfile.quote)}`,
          },
          {
            name: `Affiliation:`,
            value: `${capitalize(characterProfile.affiliation)}`,
          }
        )
        .setTimestamp();

      if (
        characterProfile.died.when !== "n/a" &&
        characterProfile.died.who === "n/a"
      ) {
        embed.addFields(
          {
            name: `Death:`,
            value: `\u200B`,
          },
          {
            name: `When:`,
            value: `${capitalize(characterProfile.died.when)}`,
            inline: true,
          }
        );
      } else if (
        characterProfile.died.when === "n/a" &&
        characterProfile.died.who !== "n/a"
      ) {
        embed.addFields(
          {
            name: `Death:`,
            value: `\u200B`,
          },
          {
            name: `Who:`,
            value: `${capitalize(characterProfile.died.who)}`,
            inline: true,
          }
        );
      } else if (
        characterProfile.died.when !== "n/a" &&
        characterProfile.died.who !== "n/a"
      ) {
        embed.addFields(
          {
            name: `Death:`,
            value: `\u200B`,
          },
          {
            name: `When:`,
            value: `${capitalize(characterProfile.died.when)}`,
            inline: true,
          },
          {
            name: `Who:`,
            value: `${capitalize(characterProfile.died.who)}`,
            inline: true,
          }
        );
      }

      interaction.reply({ embeds: [embed] });
    }
  },
};

const capitalize = ([first, ...rest]) => first.toUpperCase() + rest.join("");
