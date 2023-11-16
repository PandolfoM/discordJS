const { SlashCommandBuilder } = require("@discordjs/builders");
const getItemNames = require("../../utils/firebaseUtils");
const colors = require("../../config/colors");
const urlShortener = require("../../utils/urlShortener");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listitems")
    .setDescription("List of all items that you are watching"),
  async execute(interaction) {
    // const embed = {
    //   color: colors.info,
    //   title: "Web Scraper",
    //   description: "List all items that are being watched",
    //   fields: [
    //     {
    //       name: "GPU",
    //       value: "LINK",
    //     },
    //     {
    //       name: "CPU",
    //       value: "LINK",
    //     },
    //   ],
    // };
    try {
      const items = await getItemNames(interaction.user.id);
      const mappedFieldsPromise = items.items.map(async (i) => ({
        name: i.name,
        value: await urlShortener(i.url),
      }));

      const mappedFields = await Promise.all(mappedFieldsPromise);

      await interaction.reply({
        embeds: [
          {
            color: colors.info,
            title: "Web Scraper",
            description: "List all items that are being watched",
            fields: mappedFields,
          },
        ],
        ephemeral: true,
      });
    } catch (error) {
      console.log(error);
    }
  },
};
