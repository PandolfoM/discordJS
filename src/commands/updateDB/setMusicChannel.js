const { SlashCommandBuilder } = require("@discordjs/builders");
const colors = require("../../config/colors");
const { doc, getDoc, updateDoc } = require("firebase/firestore");
const db = require("../../firebaseConfig");
const logger = require("../../utils/logger");
const { errorEmbed } = require("../../config/embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("musicchannel")
    .setDescription("Set a channel where music can be played")
    .addStringOption((option) =>
      option.setName("channel").setDescription("ID of channel")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction, client) {
    const channelID = interaction.options.getString("channel");
    const guild = client.guilds.cache.get(interaction.guild.id);

    const channel = guild.channels.cache.get(channelID);

    if (channelID === null) {
      setMusicChannel("0", interaction);
    } else if (channel) {
      setMusicChannel(channelID, interaction);
    } else {
      await interaction.reply({
        embeds: [
          {
            color: colors.error,
            title: "Not a valid channel ID",
          },
        ],
      });
    }
  },
};

async function setMusicChannel(channelID, interaction) {
  try {
    const ref = doc(db, "settings", interaction.guild.id);
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      await updateDoc(ref, {
        musicChannel: channelID,
      });

      if (channelID === "0") {
        await interaction.reply({
          embeds: [
            {
              color: colors.success,
              title: `Music channel removed`,
            },
          ],
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          embeds: [
            {
              color: colors.success,
              title: `Music channel set to <#${channelID}>`,
            },
          ],
          ephemeral: true,
        });
      }
    }
  } catch (error) {
    logger(error);
    await interaction.editReply({
      embeds: [errorEmbed],
      ephemeral: true,
    });
  }
}
