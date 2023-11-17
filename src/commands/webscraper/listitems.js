const { SlashCommandBuilder } = require("@discordjs/builders");
const { getItemNames, removeItemNumber } = require("../../utils/firebaseUtils");
const colors = require("../../config/colors");
const urlShortener = require("../../utils/urlShortener");
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listitems")
    .setDescription("List of all items that you are watching"),
  async execute(interaction) {
    try {
      const items = await getItemNames(interaction.user.id);

      if (items.length > 0) {
        const mappedFieldsPromise = items.map(async (i, index) => ({
          name: `[${index + 1}] ${i.name.toUpperCase()}`,
          value: await urlShortener(i.url),
        }));

        const mappedFields = await Promise.all(mappedFieldsPromise);

        const allFields = mappedFields.concat({
          name: "Remove item",
          value: "Press button below to remove item",
        });
        const buttons = items.map((i, index) => {
          return new ButtonBuilder()
            .setCustomId(`${index + 1}`)
            .setLabel(`${index + 1}`)
            .setStyle(ButtonStyle.Danger);
        });
        const row = new ActionRowBuilder().addComponents(buttons);

        const response = await interaction.reply({
          embeds: [
            {
              color: colors.info,
              title: "Web Scraper",
              description: "These are all the items you are currently watching",
              thumbnail: {
                url: "https://media.tenor.com/IVh7YxGaB_4AAAAC/nerd-emoji.gif",
              },
              fields: allFields,
            },
          ],
          components: [row],
          ephemeral: true,
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id;

        try {
          const confirmation = await response.awaitMessageComponent({
            filter: collectorFilter,
            time: 60_000,
          });
          if (confirmation.customId) {
            const removeItem = await removeItemNumber(
              interaction.user.id,
              confirmation.customId - 1
            );

            await interaction.editReply({
              components: [],
              embeds: [
                {
                  color: colors.info,
                  title: "Web Scraper",
                  description: removeItem,
                },
              ],
            });
          }
        } catch (e) {
          await interaction.editReply({
            components: [],
            embeds: [
              {
                color: colors.info,
                title: "Web Scraper",
                description: "No item was selected",
              },
            ],
          });
        }
      } else {
        await interaction.reply({
          content: "You don't have any watched items",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};
