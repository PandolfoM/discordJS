const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");

module.exports = {
  category: "Music",
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Add a filter to the audio")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Select filter type")
        // .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = [
      "off",
      "3d",
      "bassboost",
      "echo",
      "karaoke",
      "nightcore",
      "surround",
    ];
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  async execute(interaction, client) {
    const filter = interaction.options.getString("type");
    const voiceChannel = interaction.member.voice.channel;
    const queue = await client.distube.getQueue(interaction);

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.error)
            .setDescription(
              `🚫 | You must be in a voice channel to use this command!`
            ),
        ],
      });
    }

    if (
      interaction.guild.members.me.voice.channelId !==
      interaction.member.voice.channelId
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.error)
            .setDescription(
              `🚫 | You need to be on the same voice channel as the Bot!`
            ),
        ],
      });
    }

    if (!filter) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.error)
            .setDescription(`🚫 | No filter selected!`),
        ],
        ephemeral: true,
      });
    }

    if (filter === "off") {
      queue.filters.clear();
    } else {
      queue.filters.clear();
      queue.filters.add(filter);
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.success)
          .setDescription(`Filter \`${filter}\` has been added to the audio!`),
      ],
    });
  },
};
