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
            embeds: [
              {
                color: colors.error,
                title: stderr,
              },
            ],
          });
          return;
        }

        await interaction.editReply({
          embeds: [
            {
              color: colors.info,
              title: stdout,
            },
          ],
        });
      });
    }

    if (interaction.options.getSubcommand() === "pm2") {
      await interaction.deferReply({ ephemeral: true });
      exec(`./su_expect_script.sh`, async (error, stdout, stderr) => {
        if (error) {
          await interaction.editReply({
            embeds: [errorEmbed],
          });
          logger(error.message);
          return;
        }

        if (stderr) {
          await interaction.editReply({
            embeds: [
              {
                color: colors.error,
                title: stderr,
              },
            ],
          });
          return;
        }
      });
    }
  },
};
