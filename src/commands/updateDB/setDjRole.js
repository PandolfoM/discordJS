const { SlashCommandBuilder } = require("@discordjs/builders");
const colors = require("../../config/colors");
const { doc, getDoc, updateDoc } = require("firebase/firestore");
const db = require("../../firebaseConfig");
const logger = require("../../utils/logger");
const { errorEmbed } = require("../../config/embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("djrole")
    .setDescription("Set the server DJ role")
    .addStringOption((option) =>
      option.setName("role").setDescription("ID of role")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    const roleID = interaction.options.getString("role");
    const guild = client.guilds.cache.get(interaction.guild.id);

    const role = guild.roles.cache.get(roleID);

    if (roleID === null) {
      setDJRole("0", interaction);
    } else if (role) {
      setDJRole(roleID, interaction);
    } else {
      await interaction.reply({
        embeds: [
          {
            color: colors.error,
            title: "Not a valid role ID",
          },
        ],
      });
    }
  },
};

async function setDJRole(roleID, interaction) {
  try {
    const ref = doc(db, "settings", interaction.guild.id);
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      await updateDoc(ref, {
        djRole: roleID,
      });

      if (roleID === "0") {
        await interaction.reply({
          embeds: [
            {
              color: colors.success,
              title: `DJ role removed`,
            },
          ],
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          embeds: [
            {
              color: colors.success,
              title: `DJ role set to:`,
              fields: [
                {
                  name: "",
                  value: `<@&${roleID}>`,
                },
              ],
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
