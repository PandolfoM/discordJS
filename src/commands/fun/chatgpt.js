const { SlashCommandBuilder } = require("@discordjs/builders");
const { OpenAI } = require("openai");
const { errorEmbed } = require("../../config/embeds");
const colors = require("../../config/colors");
const { PermissionFlagsBits } = require("discord.js");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// const openai = new OpenAIApi(config);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chatgpt")
    .setDescription("Ask OpenAI something")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Prompt to ask OpenAI")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const question = interaction.options.getString("prompt");

    const prompt = `
      Question: ${question}\n
      Epicans:
    `;

    try {
      await interaction.reply({
        embeds: [
          {
            color: colors.info,
            title: "One moment...",
          },
        ],
      });

      const response = await openai.chat.completions.create({
        prompt,
        model: "gpt-3.5-turbo",
        // max_tokens: 500,
        // temperature: 0.7,
        // top_p: 1,
        // frequency_penalty: 0,
        // presence_penalty: 0,
        stop: ["\n"],
      });
      const text = response.data.choices[0].text.substring(0);

      return await interaction.editReply(String(text));
    } catch (e) {
      if (OpenAI.RateLimitError) {
        return interaction.editReply({
          embeds: [
            {
              color: colors.error,
              title: "Rate limit exceeded!",
            },
          ],
        });
      }
      return await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
