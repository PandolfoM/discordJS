const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { OpenAI } = require("openai");
const { errorEmbed } = require("../../config/embeds");
const colors = require("../../config/colors");
const logger = require("../../utils/logger");

const MODEL = "gpt-5-nano";
const MAX_MESSAGE_LENGTH = 2000;

// Created lazily so a missing key doesn't crash the bot at startup.
let openai;
const getOpenAI = () =>
  (openai ??= new OpenAI({ apiKey: process.env.OPENAI_KEY }));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chatgpt")
    .setDescription("Ask OpenAI something")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Prompt to ask OpenAI")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const prompt = interaction.options.getString("prompt");
    await interaction.deferReply();

    try {
      const completion = await getOpenAI().chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are Epicans, a friendly Discord bot. Keep answers short.",
          },
          { role: "user", content: prompt },
        ],
      });

      const text =
        completion.choices[0]?.message?.content?.trim() ||
        "I have nothing to say.";
      await interaction.editReply(
        text.length > MAX_MESSAGE_LENGTH
          ? `${text.slice(0, MAX_MESSAGE_LENGTH - 3)}...`
          : text,
      );
    } catch (error) {
      if (error instanceof OpenAI.RateLimitError) {
        return interaction.editReply({
          embeds: [{ color: colors.error, title: "Rate limit exceeded!" }],
        });
      }
      logger(error);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
