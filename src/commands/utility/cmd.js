const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const colors = require("../../config/colors");
const logger = require("../../utils/logger");
const { errorEmbed } = require("../../config/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cmd")
    .setDescription("Git command")
    .addSubcommand((subcommand) =>
      subcommand.setName("gitpull").setDescription("Git pull")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("pm2")
        .setDescription("Runs the reload sequence for pm2")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "gitpull") {
      await interaction.deferReply({ ephemeral: true });
      exec("git pull", async (error, stdout, stderr) => {
        if (error) {
          await interaction.editReply({
            embeds: [errorEmbed],
          });
          logger(error.message);
          return;
        }

        if (stderr) {
          await interaction.editReply({
            embeds: [errorEmbed],
          });
          logger(stderr);
          return;
        }

        if (stdout.includes("Already up to date")) {
          await interaction.editReply({
            embeds: [
              {
                color: colors.info,
                title: "Already up to date",
              },
            ],
          });
        } else {
          await interaction.editReply({
            embeds: [
              {
                color: colors.info,
                title: "Pull Successful",
              },
            ],
          });
        }
      });
    }

    if (interaction.options.getSubcommand() === "pm2") {
      exec(`../pm2_expect.sh`, async (error, stdout, stderr) => {
        if (error) {
          await interaction.reply({
            embeds: [errorEmbed],
          });
          logger(error.message);
          return;
        }

        if (stderr) {
          await interaction.reply({
            embeds: [errorEmbed],
          });
          logger(stderr);
          return;
        }
      });
    }
  },
};
