const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const colors = require("../config/colors");

/** Builds a "how X are you" command (/hot, /sus) with four emoji tiers. */
function createRatingCommand({ name, title, description, userDescription, adjective, tiers }) {
  return {
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(description)
      .addSubcommand((subcommand) =>
        subcommand
          .setName("user")
          .setDescription(userDescription)
          .addUserOption((option) =>
            option.setName("target").setDescription("The user mentioned"),
          ),
      ),
    async execute(interaction) {
      const user = interaction.options.getUser("target") ?? interaction.user;
      const percent = Math.floor(Math.random() * 101);
      const emoji = tiers[Math.min(Math.floor(percent / 25), tiers.length - 1)];

      const embed = new EmbedBuilder()
        .setColor(colors.info)
        .setAuthor({ name: title })
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "User:", value: `${user}` },
          {
            name: "Results:",
            value: `${user.username} is **${percent}%** ${adjective} ${emoji}`,
          },
        );

      await interaction.reply({ embeds: [embed] });
    },
  };
}

module.exports = createRatingCommand;
