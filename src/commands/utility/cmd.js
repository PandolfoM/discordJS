const path = require("node:path");
const { promisify } = require("node:util");
const execFile = promisify(require("node:child_process").execFile);
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  InteractionContextType,
  MessageFlags,
} = require("discord.js");
const colors = require("../../config/colors");
const logger = require("../../utils/logger");
const { errorEmbed } = require("../../config/embeds");

const PROJECT_ROOT = path.join(__dirname, "..", "..", "..");
const BRANCHES = ["main", "develop"];
// Only the bot owner can update or restart the bot, not every server admin.
const OWNER_ID = "248910149442338816";

const info = (title) => ({ embeds: [{ color: colors.info, title }] });
const git = (...args) => execFile("git", args, { cwd: PROJECT_ROOT });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cmd")
    .setDescription("Git command")
    .addSubcommand((subcommand) =>
      subcommand.setName("gitpull").setDescription("Git pull"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("pm2").setDescription("Restart the bot with pm2"),
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
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        embeds: [
          { color: colors.error, title: "Only the bot owner can use /cmd" },
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === "gitpull") {
        // git writes progress to stderr on success, so only the exit code matters.
        const { stdout } = await git("pull");
        return interaction.editReply(
          info(
            stdout.includes("Already up to date")
              ? "Already up to date"
              : "Pull Successful. Use /cmd pm2 to restart with the changes.",
          ),
        );
      }

      if (subcommand === "pm2") {
        // pm2 sets pm_id for the processes it manages.
        const pmId = process.env.pm_id;
        if (pmId === undefined) {
          return interaction.editReply({
            embeds: [
              { color: colors.error, title: "The bot isn't running under pm2" },
            ],
          });
        }
        // Reloading restarts this process, so reply before running it.
        await interaction.editReply(info("Restarting..."));
        await execFile("pm2", ["reload", pmId]);
        return;
      }

      const branch = interaction.options.getString("branch");
      if (!BRANCHES.includes(branch)) {
        throw new Error(`Unexpected branch: ${branch}`);
      }
      await git("fetch", "origin");
      await git("checkout", branch);
      await git("pull", "origin", branch);
      await interaction.editReply(
        info(`Checked out ${branch}. Use /cmd pm2 to restart with it.`),
      );
    } catch (error) {
      logger(error.stderr || error.message);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
