const {
  query,
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDoc,
  where,
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

async function addItem(userid, url, name) {
  try {
    const ref = doc(db, "webscraper", userid);
    await updateDoc(ref, {
      items: arrayUnion({ url: url, name: name }),
    });
  } catch (error) {
    console.log(error);
  }
}

async function removeUrl(userid, url) {
  try {
    const snap = await getDoc(doc(db, "webscraper", userid));
    if (snap.exists()) {
      const newArr = snap.data().items.filter((i) => i.url !== url);
      await updateDoc(doc(db, "webscraper", userid), {
        items: newArr,
      });
    } else {
      console.log("no items");
    }
  } catch (error) {
    console.log(error);
  }
}

async function getItemNames(userid) {
  try {
    const snap = await getDoc(doc(db, "webscraper", userid));
    if (snap.exists()) {
      return snap.data().items;
    } else {
      console.log("No items");
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getUrls,
  addItem,
  removeUrl,
  getItemNames,
};
