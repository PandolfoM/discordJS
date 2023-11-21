const { SlashCommandBuilder } = require("discord.js");
const colors = require("../../config/colors");
const { hasDJ } = require("../../utils/musicUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show music queue"),
  async execute(interaction, client) {
    const channel = interaction.member?.voice.channel;
    const guildid = interaction.guild.id;

    if (await hasDJ(interaction)) {
      if (channel) {
        if (client.musicQueue.get(guildid)) {
          try {
            const queue = client.musicQueue.get(guildid).queue;

            if (queue.length > 0) {
              const mappedFieldsPromise = queue.map(async (i, index) => ({
                name: " ",
                value: `[${index + 1}] [${i.title}](${i.url})`,
              }));

              const mappedFields = await Promise.all(mappedFieldsPromise);

              await interaction.reply({
                embeds: [
                  {
                    color: colors.info,
                    title: "Music Queue",
                    fields: mappedFields,
                  },
                ],
              });
            }
          } catch (error) {
            console.error(error);
            await interaction.reply("There has been an error!");
          }
        } else {
          await interaction.reply({
            embeds: [
              {
                color: colors.error,
                title: "No music in the queue",
              },
            ],
          });
        }
      } else {
        await interaction.reply({
          embeds: [
            {
              color: colors.error,
              title: "Join a voice channel and try again",
            },
          ],
        });
      }
    }
  },
};
