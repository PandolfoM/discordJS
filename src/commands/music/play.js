const {
  SlashCommandBuilder,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");
const colors = require("../../config/colors");
const { statusEmbed } = require("../../config/embeds");
const { ensureVoice } = require("../../utils/musicUtils");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The keyword or URL of the song to play")
        .setRequired(true),
    )
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, client) {
    const voice = await ensureVoice(interaction, client, {
      requireQueue: false,
    });
    if (!voice) {
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      await client.distube.play(
        voice.voiceChannel,
        interaction.options.getString("song"),
        {
          textChannel: interaction.channel,
          member: interaction.member,
        },
      );
      await interaction.editReply({
        embeds: [statusEmbed(colors.success, "🔍 | Successful search!")],
      });
    } catch (error) {
      console.error("Play error:", error);
      await interaction.editReply({
        embeds: [
          statusEmbed(
            colors.error,
            `🚫 | Couldn't play that: ${String(error.message ?? error).slice(0, 1000)}`,
          ),
        ],
      });
    }
  },
};
