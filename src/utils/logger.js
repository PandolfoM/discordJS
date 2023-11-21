const { codeBlock } = require("discord.js");
const { client } = require("../bot");

async function Logger(log) {
  try {
    const channel = client.channels.cache.get("1176505370634637372");
    console.log(typeof log);
    if (typeof log === "object") {
      channel.send(codeBlock("js", JSON.stringify(log)));
    } else {
      channel.send(log);
    }
  } catch (error) {
    console.error(`Could not send message to channel`);
  }
}

module.exports = Logger;
