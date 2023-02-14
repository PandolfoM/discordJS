const Character = require("../schemas/characters");
const mongoose = require("mongoose");

module.exports = (client) => {
  client.findInfo = async (member, name) => {
    let characterProfile = await Character.findOne({
      guildId: member.guild.id,
      searchterm: name,
    });
    if (characterProfile) {
      return characterProfile;
    } else {
      return false;
    }
  };

  client.addInfo = async (
    member,
    searchterm,
    img,
    fname,
    lname,
    weapon,
    species,
    aff,
    diedwhen,
    diedwho,
    fact,
    quote,
    color
  ) => {
    let characterProfile = await Character.insertMany({
      guildId: member.guild.id,
      searchterm: searchterm,
      img: img,
      fname: fname,
      lname: lname,
      weapon: weapon,
      species: species,
      affiliation: aff,
      died: { when: diedwhen, who: diedwho },
      fact: fact,
      quote: quote,
      color: color,
    });
    if (characterProfile) {
      return true;
    } else {
      return false;
    }
  };

  client.delInfo = async (id) => {
    let characterProfile = await Character.deleteOne({ _id: id });
    if (characterProfile) {
      return true;
    } else {
      return false;
    }
  };

  client.getId = async (member, name) => {
    let characterProfile = await Character.findOne({
      guildId: member.guild.id,
      fname: name,
    });
    if (characterProfile) {
      return characterProfile;
    } else {
      return false;
    }
  };
};
