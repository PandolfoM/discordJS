const {
  query,
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDoc,
} = require("firebase/firestore");
const db = require("../firebaseConfig");

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
    console.log(error);
  }
}

async function removeUrl(userid, url) {
  try {
    const ref = doc(db, "webscraper", userid);
    await updateDoc(ref, {
      urls: arrayRemove(url),
    });
  } catch (error) {
    console.log(error);
  }
}

async function getItemNames(userid) {
  try {
    const snap = await getDoc(doc(db, "itemnames", userid));
    if (snap.exists()) {
      return snap.data();
    } else {
      return "no items";
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = getUrls;
module.exports = addUrl;
module.exports = removeUrl;
module.exports = getItemNames;
