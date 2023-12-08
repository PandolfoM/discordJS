const { SlashCommandBuilder } = require("@discordjs/builders");
const colors = require("../../config/colors");
const { doc, getDoc, updateDoc } = require("firebase/firestore");
const db = require("../../firebaseConfig");
const logger = require("../../utils/logger");
const { errorEmbed } = require("../../config/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("devchannel")
    .setDescription("Set a channel where devs can test commands")
    .addStringOption((option) =>
      option.setName("channel").setDescription("ID of channel")
    ),
  async execute(interaction, client) {
    const channelID = interaction.options.getString("channel");
    const guild = client.guilds.cache.get(interaction.guild.id);

    const channel = guild.channels.cache.get(channelID);

    if (channelID === null) {
      setDevChannel("0", interaction);
    } else if (channel) {
      setDevChannel(channelID, interaction);
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

async function setDevChannel(channelID, interaction) {
  try {
    const ref = doc(db, "settings", interaction.guild.id);
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      await updateDoc(ref, {
        devChannel: channelID,
      });

      if (channelID === "0") {
        await interaction.reply({
          embeds: [
            {
              color: colors.success,
              title: `Dev channel removed`,
            },
          ],
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          embeds: [
            {
              color: colors.success,
              title: `Dev channel set to https://discord.com/channels/${interaction.guild.id}/${channelID}`,
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
