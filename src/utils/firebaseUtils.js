const {
  query,
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} = require("firebase/firestore");
const db = require("../firebaseConfig");
const logger = require("./logger");

async function getUrls() {
  try {
    const q = query(collection(db, "webscraper"));
    const qSnapshot = await getDocs(q);

    return qSnapshot.docs.map((i) => ({ id: i.id, urls: i.data().urls }));
  } catch (error) {
    return;
  }
}

async function addUrl(userid, url) {
  try {
    const ref = doc(db, "webscraper", userid);
    await updateDoc(ref, {
      urls: arrayUnion(url),
    });
  } catch (error) {
    logger(error);
  }
}

async function removeUrl(userid, url) {
  try {
    const ref = doc(db, "webscraper", userid);
    await updateDoc(ref, {
      urls: arrayRemove(url),
    });
  } catch (error) {
    logger(error);
  }
}

module.exports = getUrls;
module.exports = addUrl;
module.exports = removeUrl;
