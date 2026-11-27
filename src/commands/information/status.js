const path = require("node:path");
const { promisify } = require("node:util");
const execFile = promisify(require("node:child_process").execFile);
const {
  EmbedBuilder,
  SlashCommandBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  TimestampStyles,
  time,
  version: discordJsVersion,
} = require("discord.js");
const colors = require("../../config/colors");

const PROJECT_ROOT = path.join(__dirname, "..", "..", "..");

/** "abc1234 (main)", or "unknown" when git isn't available. */
async function readCommit() {
  try {
    const { stdout } = await execFile(
      "git",
      ["log", "-1", "--format=%h%x09%D"],
      { cwd: PROJECT_ROOT, timeout: 5000 },
    );
    const [hash, refs = ""] = stdout.trim().split("\t");
    const branch = refs.match(/HEAD -> ([^,]+)/)?.[1];
    return branch ? `${hash} (${branch})` : hash;
  } catch {
    return "unknown";
  }
}

// Read once: the code running doesn't change until the bot restarts, even if
// a pull updates the files on disk.
let commit;
const runningCommit = () => (commit ??= readCommit());

const megabytes = (bytes) => `${Math.round(bytes / 1024 / 1024)} MB`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Show how the bot is doing: uptime, memory, ping, version")
    // Versions and the running commit are for admins, not every member.
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const startedAt = new Date(Date.now() - client.uptime);
    const { rss, heapUsed } = process.memoryUsage();
    const ping = client.ws.ping;
    const pm2 =
      process.env.pm_id === undefined ? "No" : `Yes (id ${process.env.pm_id})`;

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setAuthor({
            name: "Status",
            iconURL: client.user.displayAvatarURL(),
          })
          .addFields(
            {
              name: "⏱️ Up since",
              value: time(startedAt, TimestampStyles.RelativeTime),
              inline: true,
            },
            {
              name: "📶 Ping",
              value: ping >= 0 ? `${ping} ms` : "Measuring...",
              inline: true,
            },
            {
              name: "🧠 Memory",
              value: `${megabytes(rss)} (heap ${megabytes(heapUsed)})`,
              inline: true,
            },
            { name: "🔖 Commit", value: await runningCommit(), inline: true },
            {
              name: "🎵 Playing in",
              value: `${client.distube.queues.size} server(s)`,
              inline: true,
            },
            { name: "⚙️ pm2", value: pm2, inline: true },
            {
              name: "📦 Versions",
              value: `Node ${process.version} · discord.js ${discordJsVersion}`,
            },
          ),
      ],
    });
  },
};
