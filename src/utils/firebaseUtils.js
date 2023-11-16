const { query, collection, getDocs } = require("firebase/firestore");
const db = require("../firebaseConfig");

async function getUrls() {
  try {
    const q = query(collection(db, "webscraper"));
    const qSnapshot = await getDocs(q);

    return qSnapshot.docs.map((doc) => ({ id: doc.id, urls: doc.data().urls }));
  } catch (error) {
    return;
  }
}

module.exports = getUrls;
