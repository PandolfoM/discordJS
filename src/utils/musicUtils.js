const colors = require("../config/colors");

const { noDjEmbed } = require("../config/embeds");

async function hasDJ(interaction, client) {
  const allowedChannelIds = [
    client.settings.get(interaction.guild.id).devChannel,
    client.settings.get(interaction.guild.id).musicChannel,
  ];
  const role = client.settings.get(interaction.guild.id).djRole;
  const musicChannel = client.settings.get(interaction.guild.id).musicChannel;
  const member = interaction.guild.members.cache.get(interaction.user.id);
  const hasRole = member.roles.cache.has(role);
  if (
    allowedChannelIds.includes(interaction.channelId) ||
    client.settings.get(interaction.guild.id).musicChannel === "0"
  ) {
    if (role === "0") {
      return true;
    } else if (hasRole) {
      return true;
    } else {
      await interaction.reply({
        embeds: [noDjEmbed],
        ephemeral: true,
      });
    }
  } else {
    await interaction.reply({
      embeds: [
        {
          color: colors.error,
          title: `Type in https://discord.com/channels/${interaction.guild.id}/${musicChannel} to play music`,
        },
      ],
      ephemeral: true,
    });
  }
}

module.exports = {
  hasDJ,
};
