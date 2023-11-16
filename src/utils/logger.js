const { codeBlock } = require("discord.js");
const { client } = require("../bot");

async function logger(message) {
  try {
    const channel = client.channels.cache.get("1174422492434141205");
    channel.send(codeBlock("js", JSON.stringify(message)));
  } catch (error) {
    console.error(`Could not send message to channel`);
  }
}

module.exports = logger;
