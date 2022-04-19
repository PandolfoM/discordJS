const Characters = require('../schemas/characters')
const mongoose = require('mongoose')

module.exports = (client) => {
  client.findCharacter = async (name) => {
    console.log(name);
  }
}