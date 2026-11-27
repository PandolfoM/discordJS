const { getSetting } = require("../utils/settings");

// #epicans-log: the default for every log type until /logs set changes one.
const LOG_CHANNEL_ID = "1176505370634637372";

/** Log types that /logs can point at their own channel. */
const LOG_TYPES = {
  errors: "Errors",
  messages: "Deleted & edited messages",
  members: "Joins & leaves",
  roles: "Role changes",
};

/** The channel a log type posts to. */
const logChannelId = (type) =>
  getSetting("logChannels")?.[type] ?? LOG_CHANNEL_ID;

/** Every channel any log type posts to (their activity isn't logged). */
const allLogChannelIds = () =>
  Object.keys(LOG_TYPES).map((type) => logChannelId(type));

module.exports = { LOG_CHANNEL_ID, LOG_TYPES, allLogChannelIds, logChannelId };
