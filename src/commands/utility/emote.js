const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  InteractionContextType,
  MessageFlags,
} = require("discord.js");
const logger = require("../../utils/logger");
const colors = require("../../config/colors");
const { errorEmbed } = require("../../config/embeds");

const MAX_EMOJI_BYTES = 256 * 1024;

function getEmoteIdFromUrl(url) {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname !== "7tv.app" && !hostname.endsWith(".7tv.app")) {
      return null;
    }
    return pathname.split("/").filter(Boolean).pop() ?? null;
  } catch {
    return null;
  }
}

/** Largest file under Discord's size limit, preferring GIF for animated emotes. */
async function getEmoteData(id) {
  const res = await fetch(
    `https://7tv.io/v3/emotes/${encodeURIComponent(id)}`,
    {
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!res.ok) {
    throw new Error(`7TV API returned ${res.status} for emote ${id}`);
  }
  const data = await res.json();
  const format = data.animated ? "GIF" : "PNG";
  const files = (
    data.host?.files ??
    data.versions?.[0]?.host?.files ??
    []
  ).filter((file) => file.format === format && file.size < MAX_EMOJI_BYTES);
  const file = files.at(-1);
  if (!file) {
    return null;
  }

  // Discord emoji names: 2-32 chars, alphanumeric/underscore.
  const name = data.name.replace(/\W/g, "").slice(0, 32).padEnd(2, "_");
  return { name, url: `https://cdn.7tv.app/emote/${id}/${file.name}` };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emote")
    .setDescription("Steal emote")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("steal")
        .setDescription("Steal an emote from 7TV")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("Url of the emoji from 7TV")
            .setRequired(true),
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const emoteId = getEmoteIdFromUrl(interaction.options.getString("url"));
    if (!emoteId) {
      return interaction.reply({
        embeds: [{ color: colors.error, title: "Not a valid 7TV URL" }],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply();

    try {
      const emote = await getEmoteData(emoteId);
      if (!emote) {
        return interaction.editReply({
          embeds: [
            {
              color: colors.error,
              title: "No version of that emote fits Discord's 256KB limit",
            },
          ],
        });
      }

      await interaction.guild.emojis.create({
        attachment: emote.url,
        name: emote.name,
      });
      await interaction.editReply({
        embeds: [
          {
            color: colors.success,
            title: `Added ${emote.name}`,
            image: { url: emote.url },
          },
        ],
      });
    } catch (error) {
      logger(error);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
