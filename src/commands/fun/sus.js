const createRatingCommand = require("../../utils/ratingCommand");

module.exports = createRatingCommand({
  name: "sus",
  title: "Sus Calculator",
  description: "Calculates how sus you are",
  userDescription: "Calculate how sus another user is",
  adjective: "sus",
  tiers: ["🧍‍♂️", "👬", "👨‍❤️‍👨", "👨‍❤️‍💋‍👨"],
});
