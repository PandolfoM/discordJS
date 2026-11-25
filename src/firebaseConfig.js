const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const app = initializeApp({
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
});

module.exports = getFirestore(app);
