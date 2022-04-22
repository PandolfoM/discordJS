const { SlashCommandBuilder } = require("@discordjs/builders");
const Character = require("../../schemas/characters");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("swadd")
    .setDescription("Add information to the Star Wars database")
    .addStringOption((option) =>
      option.setName("searchterm").setRequired(true).setDescription("Search Term")
    )
    .addStringOption((option) =>
      option.setName("img").setRequired(true).setDescription("Image")
    )
    .addStringOption((option) =>
      option.setName("firstname").setRequired(true).setDescription("First Name")
    )
    .addStringOption((option) =>
      option.setName("lastname").setRequired(true).setDescription("Last Name")
    )
    .addStringOption((option) =>
      option.setName("weapon").setRequired(true).setDescription("Weapon")
    )
    .addStringOption((option) =>
      option.setName("species").setRequired(true).setDescription("Species")
    )
    .addStringOption((option) =>
      option
        .setName("affiliation")
        .setRequired(true)
        .setDescription("Affiliation")
    )
    .addStringOption((option) =>
      option
        .setName("diedwhen")
        .setRequired(true)
        .setDescription("When character died")
    )
    .addStringOption((option) =>
      option
        .setName("diedwho")
        .setRequired(true)
        .setDescription("Who character died to")
    )
    .addStringOption((option) =>
      option.setName("fact").setRequired(true).setDescription("Fact")
    )
    .addStringOption((option) =>
      option.setName("quote").setRequired(true).setDescription("Quote")
    )
    .addStringOption((option) =>
      option.setName("color").setRequired(true).setDescription("Color of embed")
    ),
  async execute(interaction, client) {
    let member = interaction.member.guild.members.cache.get(
      interaction.user.id
    );
    let hasRole = member.roles.cache.some((role) => role.name === "DB");
    if (hasRole) {
      let searchTerm = interaction.options.getString("searchterm").toLowerCase();
      let img = interaction.options.getString("img");
      let firstName = interaction.options.getString("firstname").toLowerCase();
      let lastName = interaction.options.getString("lastname").toLowerCase();
      let weapon = interaction.options.getString("weapon").toLowerCase();
      let species = interaction.options.getString("species").toLowerCase();
      let affiliation = interaction.options
        .getString("affiliation")
        .toLowerCase();
      let diedwhen = interaction.options.getString("diedwhen").toLowerCase();
      let diedwho = interaction.options.getString("diedwho").toLowerCase();
      let fact = interaction.options.getString("fact").toLowerCase();
      let quote = interaction.options.getString("quote").toLowerCase();
      let color = interaction.options.getString("color").toUpperCase();
      const characterProfile = await client.addInfo(
        interaction.member,
        searchTerm,
        img,
        firstName,
        lastName,
        weapon,
        species,
        affiliation,
        diedwhen,
        diedwho,
        fact,
        quote,
        color
      );
      if (characterProfile) {
        await interaction.reply({
          content: `Successfully added ${firstName} ${lastName}`,
        });
      } else {
        await interaction.reply({
          content: `Failed to add ${firstName} ${lastName}`,
        });
      }
    } else {
      interaction.reply({
        content: "You do not have permission",
        ephemeral: true,
      });
    }
  },
};
