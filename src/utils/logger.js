const { codeBlock } = require("discord.js");
const { client } = require("../bot");

async function logger(message) {
  try {
    const channel = client.channels.cache.get("1176505370634637372");
    channel.send(codeBlock("js", message));
  } catch (error) {
    console.error(`Could not send message to channel`);
  }
}

module.exports = logger;
