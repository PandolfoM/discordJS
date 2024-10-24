const { SlashCommandBuilder } = require("@discordjs/builders");
const { default: axios } = require("axios");
const logger = require("../../utils/logger");
const { PermissionFlagsBits } = require("discord.js");
const colors = require("../../config/colors");

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
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "steal") {
      const url = interaction.options.getString("url");

      if (!url.includes("7tv.app")) {
        return await interaction.reply({
          embeds: [
            {
              color: colors.error,
              title: "Not a valid 7TV URL",
            },
          ],
          ephemeral: true,
        });
      }

      const emoteID = getEmoteIdFromUrl(url);

      try {
        const emoteData = await getEmoteData(emoteID);
        await interaction.guild.emojis.create({
          attachment: emoteData.emote,
          name: emoteData.name,
        });

        await interaction.reply({
          embeds: [
            {
              color: colors.success,
              title: `Added ${emoteData.name}`,
              image: {
                url: emoteData.emote,
              },
            },
          ],
          ephemeral: true,
        });
      } catch (error) {
        logger(error);
      }
    }
  },
};

function getEmoteIdFromUrl(url) {
  const urlSegments = url.split("/");
  return urlSegments[urlSegments.length - 1];
}

async function getEmoteData(id) {
  try {
    const res = await axios.get("https://7tv.io/v3/emotes/" + id);
    if (res) {
      let emote = "";
      const files = res.data.versions[0].host.files;

      if (res.data.animated) {
        const gifData = files.filter((item) => {
          return item.format === "GIF" && item.size < 262144;
        });

        emote = `https://cdn.7tv.app/emote/${id}/${gifData[gifData.length - 1].name}`;
      } else {
        const pngData = files.filter((item) => {
          return item.format === "PNG" && item.size < 262144;
        });

        emote = `https://cdn.7tv.app/emote/${id}/${pngData[pngData.length - 1].name}`;
      }

      return {
        name: res.data.name,
        emote: emote,
      };
    }
  } catch (error) {
    logger(error);
  }
}
