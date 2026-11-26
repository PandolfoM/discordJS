const createRatingCommand = require("../../utils/ratingCommand");

module.exports = createRatingCommand({
  name: "hot",
  title: "Hot Calculator",
  description: "Calculates how hot you are",
  userDescription: "Calculate how hot another user is",
  adjective: "hot",
  tiers: ["💔", "❤", "💖", "💞"],
});
