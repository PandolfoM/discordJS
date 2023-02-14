const mongoose = require("mongoose");
const fs = require("fs");
const mongodbFiles = fs
  .readdirSync("./src/mongodb")
  .filter((file) => file.endsWith(".js"));

module.exports = (client) => {
  client.dbLogin = async () => {
    for (file of mongodbFiles) {
      const event = require(`../mongodb/${file}`);
      if (event.once) {
        mongoose.connection.once(event.name, (...args) => event.execute(...args));
      } else {
        mongoose.connection.on(event.name, (...args) => event.execute(...args));
      }
    }
    mongoose.Promise = global.Promise;
    await mongoose.connect(process.env.DBTOKEN, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  };
};
