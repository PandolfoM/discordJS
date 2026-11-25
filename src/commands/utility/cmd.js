const { promisify } = require("node:util");
const exec = promisify(require("node:child_process").exec);
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  InteractionContextType,
  MessageFlags,
} = require("discord.js");
const colors = require("../../config/colors");
const logger = require("../../utils/logger");
const { errorEmbed } = require("../../config/embeds");

const SCRIPTS = {
  pm2: "../pm2_expect.sh",
  main: "../gitmain_expect.sh",
  develop: "../gitdevelop_expect.sh",
};

const info = (title) => ({ embeds: [{ color: colors.info, title }] });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cmd")
    .setDescription("Git command")
    .addSubcommand((subcommand) =>
      subcommand.setName("gitpull").setDescription("Git pull"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("pm2")
        .setDescription("Runs the reload sequence for pm2"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("checkout")
        .setDescription("Checkout to either main or develop branch")
        .addStringOption((option) =>
          option
            .setName("branch")
            .setDescription("Branch to checkout to")
            .setRequired(true)
            .addChoices(
              { name: "Main", value: "main" },
              { name: "Develop", value: "develop" },
            ),
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === "gitpull") {
        // git writes progress to stderr on success, so only the exit code matters.
        const { stdout } = await exec("git pull");
        return interaction.editReply(
          info(stdout.includes("Already up to date") ? "Already up to date" : "Pull Successful"),
        );
      }

      if (subcommand === "pm2") {
        // pm2 reload restarts this process, so reply before running it.
        await interaction.editReply(info("Reloading..."));
        await exec(SCRIPTS.pm2);
        return;
      }

      const branch = interaction.options.getString("branch");
      await exec(SCRIPTS[branch]);
      await interaction.editReply(info(`Checked out ${branch}`));
    } catch (error) {
      logger(error.stderr || error.message);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
