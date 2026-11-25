const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  MessageFlags,
} = require("discord.js");
const { getItems, removeItem } = require("../../db/watchlist");
const colors = require("../../config/colors");
const urlShortener = require("../../utils/urlShortener");

// Embeds allow 25 fields (one is used for the footer note); 5 rows x 5 buttons.
const MAX_ITEMS = 24;
const BUTTONS_PER_ROW = 5;
const BUTTON_PREFIX = "listitems:remove:";
const THUMBNAIL = "https://media.tenor.com/IVh7YxGaB_4AAAAC/nerd-emoji.gif";

const scraperEmbed = (description, fields) => ({
  color: colors.info,
  title: "Web Scraper",
  description,
  ...(fields && { thumbnail: { url: THUMBNAIL }, fields }),
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listitems")
    .setDescription("List of all items that you are watching"),
  async execute(interaction) {
    const userId = interaction.user.id;
    const items = getItems(userId).slice(0, MAX_ITEMS);

    if (!items.length) {
      return interaction.reply({
        embeds: [{ color: colors.error, title: "You don't have any watched items" }],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Shortening links can take a while; defer so the interaction doesn't time out.
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const fields = await Promise.all(
      items.map(async (item, index) => ({
        name: `[${index + 1}] ${item.name.toUpperCase()}`.slice(0, 256),
        value: await urlShortener(item.url),
      })),
    );
    fields.push({ name: "Remove item", value: "Press button below to remove item" });

    const rows = [];
    for (let i = 0; i < items.length; i += BUTTONS_PER_ROW) {
      rows.push(
        new ActionRowBuilder().addComponents(
          items.slice(i, i + BUTTONS_PER_ROW).map((item, offset) =>
            new ButtonBuilder()
              // Row id, not position, so removal is right even if the list changed.
              .setCustomId(`${BUTTON_PREFIX}${item.id}`)
              .setLabel(`${i + offset + 1}`)
              .setStyle(ButtonStyle.Danger),
          ),
        ),
      );
    }

    const message = await interaction.editReply({
      embeds: [scraperEmbed("These are all the items you are currently watching", fields)],
      components: rows,
    });

    let click;
    try {
      click = await message.awaitMessageComponent({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === userId && i.customId.startsWith(BUTTON_PREFIX),
        time: 60_000,
      });
    } catch {
      return interaction.editReply({
        embeds: [scraperEmbed("No item was selected")],
        components: [],
      });
    }

    const itemId = Number(click.customId.slice(BUTTON_PREFIX.length));
    const removedName = removeItem(userId, itemId);
    await click.update({
      embeds: [scraperEmbed(removedName ? `Removed: ${removedName}` : "That item no longer exists.")],
      components: [],
    });
  },
};
