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
const INSTALL_TIMEOUT_MS = 10 * 60 * 1000;
// Only one /cmd runs at a time, so a double click can't run two pulls or
// installs over each other.
let busy = false;

/** Replies, then reloads this process with pm2. Returns false if not under pm2. */
async function restart(interaction, message) {
  // pm2 sets pm_id for the processes it manages.
  const pmId = process.env.pm_id;
  if (pmId === undefined) {
    return false;
  }
  // Reloading restarts this process, so reply before running it.
  await interaction.editReply(info(message));
  await execFile("pm2", ["reload", pmId]);
  return true;
}

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
        .setName("deploy")
        .setDescription(
          "Pull the latest code, install packages if they changed, and restart",
        ),
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
    if (busy) {
      return interaction.reply({
        embeds: [
          { color: colors.error, title: "Another /cmd is still running" },
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    busy = true;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const subcommand = interaction.options.getSubcommand();

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
        if (!(await restart(interaction, "Restarting..."))) {
          await interaction.editReply({
            embeds: [
              { color: colors.error, title: "The bot isn't running under pm2" },
            ],
          });
        }
        return;
      }

      if (subcommand === "deploy") {
        const before = (await git("rev-parse", "HEAD")).stdout.trim();
        await interaction.editReply(info("Pulling..."));
        await git("pull", "--ff-only");
        const after = (await git("rev-parse", "HEAD")).stdout.trim();
        if (before === after) {
          return interaction.editReply(info("Already up to date"));
        }

        const { stdout: changed } = await git(
          "diff",
          "--name-only",
          before,
          after,
          "--",
          "package.json",
          "package-lock.json",
        );
        if (changed.trim()) {
          await interaction.editReply(info("Installing packages..."));
          try {
            await execFile("npm", ["ci"], {
              cwd: PROJECT_ROOT,
              timeout: INSTALL_TIMEOUT_MS,
            });
          } catch (error) {
            // The running bot still has the old packages loaded, but a restart
            // now would start the new code without them.
            logger("npm ci failed during /cmd deploy:", error.message);
            return interaction.editReply({
              embeds: [
                {
                  color: colors.error,
                  title: "Installing packages failed, so I didn't restart",
                  description:
                    `The code is at ${after.slice(0, 7)} but packages aren't ` +
                    "installed. Run `npm ci` on the server before restarting.",
                },
              ],
            });
          }
        }

        const short = after.slice(0, 7);
        if (!(await restart(interaction, `Deployed ${short}. Restarting...`))) {
          await interaction.editReply(
            info(`Deployed ${short}. Restart the bot to use it.`),
          );
        }
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
    } finally {
      busy = false;
    }
  },
};
