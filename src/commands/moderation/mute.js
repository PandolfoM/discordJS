const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");
const dayjs = require("dayjs");
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes member")
    .addUserOption((option) =>
      option.setName("target").setRequired(true).setDescription("User to mute")
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setRequired(true)
        .setDescription("How long to mute user (minutes)")
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for mute")
    ),
  permissions: [Permissions.FLAGS.MODERATE_MEMBERS],
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const duration = Number(
      interaction.options.getString("duration") * 60 * 1000
    );
    let reason = interaction.options.getString("reason");
    const member = await interaction.guild.members.fetch(user.id);

    if (!member) {
      await interaction.reply({ content: "Invalid User", ephemeral: true });
    }

    if (!duration) {
      await interaction.reply({
        content: "No duration provided",
        ephemeral: true,
      });
    }

    if (!reason) {
      reason = "No reason provided";
    }

    const muteEnd = dayjs(Date.now())
      .add(duration / 60000, "m")
      .format("LTS");
    const embed = new MessageEmbed()
      .setTitle(`${user.tag} has been muted`)
      .setThumbnail(user.avatarURL({ dynamic: true }))
      .setColor("BLUE")
      .addFields(
        {
          name: `Duration of timeout:`,
          value: `${duration / 60000} Minute(s)`,
        },
        { name: "Mute until:", value: `${muteEnd}` }
      )
      .setTimestamp();

    try {
      await member.timeout(duration, reason);
      await interaction.channel.send({ embeds: [embed] });
    } catch (error) {
      await interaction.channel.send("Not enough permission");
    }
  },
};
