const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { RepeatMode } = require("distube");
const colors = require("../config/colors");
const { statusEmbed } = require("../config/embeds");
const { ensureVoice } = require("./musicUtils");

const PREFIX = "music:";

const REPEAT_MESSAGES = {
  [RepeatMode.DISABLED]: "🔁 | Repeat mode is now off!",
  [RepeatMode.SONG]: "🔂 | Song loop mode is on!",
  [RepeatMode.QUEUE]: "🔁 | Playlist looping is enabled!",
};

/** Buttons shown under the "Now playing" message. */
function musicControls() {
  const button = (action, emoji, label, style = ButtonStyle.Secondary) =>
    new ButtonBuilder()
      .setCustomId(PREFIX + action)
      .setEmoji(emoji)
      .setLabel(label)
      .setStyle(style);

  return [
    new ActionRowBuilder().addComponents(
      button("pause", "⏯️", "Pause/Resume"),
      button("skip", "⏭️", "Skip"),
      button("stop", "⏹️", "Stop", ButtonStyle.Danger),
      button("loop", "🔁", "Loop"),
    ),
  ];
}

const isMusicButton = (interaction) =>
  interaction.isButton() && interaction.customId.startsWith(PREFIX);

/**
 * Runs a music button. Pause, skip and stop reuse the slash commands, so the
 * buttons get the same voice channel, music channel and DJ role checks.
 */
async function handleMusicButton(interaction, client) {
  const action = interaction.customId.slice(PREFIX.length);

  if (action === "loop") {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }
    // With no argument DisTube cycles Off -> Song -> Playlist -> Off.
    const mode = voice.queue.setRepeatMode();
    return interaction.reply({
      embeds: [
        statusEmbed(
          colors.success,
          `${REPEAT_MESSAGES[mode]} (by ${interaction.user})`,
        ),
      ],
    });
  }

  let commandName = action;
  if (action === "pause") {
    commandName = client.distube.getQueue(interaction.guildId)?.paused
      ? "resume"
      : "pause";
  }
  const command = ["pause", "resume", "skip", "stop"].includes(commandName)
    ? client.commands.get(commandName)
    : null;
  if (!command) {
    throw new Error(`Unknown music button: ${interaction.customId}`);
  }
  return command.execute(interaction, client);
}

module.exports = { handleMusicButton, isMusicButton, musicControls };
