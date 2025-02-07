module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    // if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    // try {
    //   await command.execute(interaction, client);
    // } catch (error) {
    //   console.error(error);
    //   return await interaction.reply({
    //     content: "There was an error while executing this command!",
    //     ephemeral: true,
    //   });
    // }

    if (interaction.isAutocomplete()) {
      if (!command.autocomplete) {
        return console.error(
          `No autocomplete handler was found for the ${interaction.commandName} command.`
        );
      }

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(error);
        return await interaction.reply({
          content:
            "There was an error while executing this autocomplete command!",
          ephemeral: true,
        });
      }
    }

    if (interaction.isCommand()) {
      // const command = client.commands.get(interaction.commandName);

      // if (!command) return console.log("Command was not found");

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        return await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};
