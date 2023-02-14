const mongoose = require("mongoose");
const characterSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  guildId: String,
  searchterm: String,
  img: String,
  fname: String,
  lname: String,
  species: String,
  affiliation: String,
  died: {
    when: String,
    who: String,
  },
  fact: String,
  quote: String,
  weapon: String,
  color: String,
});

module.exports = mongoose.model("Characters", characterSchema, "characters");
