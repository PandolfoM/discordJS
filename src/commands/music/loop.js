const {
  EmbedBuilder,
  SlashCommandBuilder,
  InteractionContextType,
} = require("discord.js");
const { RepeatMode } = require("distube");
const colors = require("../../config/colors");
const { ensureVoice } = require("../../utils/musicUtils");

const MESSAGES = {
  [RepeatMode.DISABLED]: "🔁 | Repeat mode is now off!",
  [RepeatMode.SONG]: "🔁 | Song loop mode is on!",
  [RepeatMode.QUEUE]: "🔁 | Playlist looping is enabled!",
};

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Loop the current song!")
    .addIntegerOption((option) =>
      option
        .setName("type")
        .setDescription("Choose the type of loop!")
        .setRequired(true)
        .addChoices(
          { name: "Turn off repeat mode", value: RepeatMode.DISABLED },
          { name: "Repeat the song", value: RepeatMode.SONG },
          { name: "Repeat song list", value: RepeatMode.QUEUE },
        ),
    )
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client);
    if (!voice) {
      return;
    }

    const mode = voice.queue.setRepeatMode(
      interaction.options.getInteger("type"),
    );
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.success)
          .setAuthor({
            name: "Repeat mode",
            iconURL: client.user.displayAvatarURL(),
          })
          .setDescription(MESSAGES[mode]),
      ],
    });
  },
};
