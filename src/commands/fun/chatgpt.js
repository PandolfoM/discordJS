const { SlashCommandBuilder } = require("@discordjs/builders");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const config = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(config);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chatgpt")
    .setDescription("Ask OpenAI something")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Prompt to ask OpenAI")
        .setRequired(true)
    ),
  async execute(interaction) {
    const question = interaction.options.getString("prompt");

    const prompt = `
      Question: ${question}\n
      Epicans:
    `;

    try {
      const response = await openai.createCompletion({
        prompt,
        model: "text-davinci-003",
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: ["\n"],
      });
      // console.log(prompt);
      const text = response.data.choices[0].text.substring(0);
      console.log(text);
      await interaction.reply("One moment...");
      return await interaction.editReply(String(text));
    } catch (e) {
      console.log(e);
      return await interaction.reply("There was an error!");
    }
  },
};
