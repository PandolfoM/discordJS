const mongoose = require("mongoose");
const characterSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  guildId: String,
  name: String,
});

module.exports = mongoose.model("Characters", characterSchema, "characters");
