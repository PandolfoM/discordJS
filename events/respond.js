module.exports = {
	name: 'messageCreate',
	execute(message) {
    if (message.content == "sybau") {
      console.log(`messageCreate: ${message}`);
      message.reply('ciaboo*')
    }
	},
};