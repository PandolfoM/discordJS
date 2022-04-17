module.exports = {
	name: 'messageCreate',
	execute(message) {
    if (message.content == "sybau") {
      message.reply('ciaboo*')
    }
	},
};