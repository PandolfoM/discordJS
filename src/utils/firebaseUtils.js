const {
  query,
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  getDoc,
} = require("firebase/firestore");
const db = require("../firebaseConfig");
const webscrapeItem = require("../functions/webscrapeItem");

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
  return (async () => {
    try {
      const ref = doc(db, "webscraper", userid);
      if (name) {
        await updateDoc(ref, {
          items: arrayUnion({ url: url, name: name }),
        });
        return true;
      } else {
        const itemName = await webscrapeItem(url);
        if (itemName) {
          await updateDoc(ref, {
            items: arrayUnion({ url: url, name: itemName }),
          });
          return true;
        }
      }
    } catch (error) {
      console.log(error);
    }
  })();
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

async function removeItemNumber(userid, index) {
  try {
    const snap = await getDoc(doc(db, "webscraper", userid));
    if (snap.exists()) {
      const data = snap.data().items;
      if (index >= 0 && index < data.length) {
        const removedItem = data.splice(index, 1)[0].name;
        data.splice(index, 1);
        await updateDoc(doc(db, "webscraper", userid), {
          items: data,
        });
        return `Removed: ${removedItem}`;
      } else {
        return "There has been an error!";
      }
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
  removeItemNumber,
  getItemNames,
};
