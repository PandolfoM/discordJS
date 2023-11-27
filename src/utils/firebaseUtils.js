const {
  query,
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  getDoc,
  setDoc,
} = require("firebase/firestore");
const db = require("../firebaseConfig");
const webscrapeItem = require("../functions/webscrapeItem");
const logger = require("./logger");
const { errorEmbed } = require("../config/embeds");
const colors = require("../config/colors");

async function getUrls() {
  try {
    const q = query(collection(db, "webscraper"));
    const qSnapshot = await getDocs(q);
    let data = [];

    qSnapshot.forEach((i) => {
      const docData = i.data();
      data = docData.items.map((item) => ({
        id: docData.id,
        url: item.url,
      }));
    });

    return data;
  } catch (error) {
    return [];
  }
}

async function addItem(interaction, url, name) {
  return (async () => {
    try {
      const ref = doc(db, "webscraper", interaction.user.id);
      const docSnap = await getDoc(ref);

      let itemToAdd;

      if (name) {
        itemToAdd = { url: url, name: name };
      } else {
        const itemName = await webscrapeItem(url);
        if (itemName) {
          itemToAdd = { url: url, name: itemName };
        }
      }

      if (docSnap.exists() && itemToAdd) {
        await updateDoc(ref, {
          items: arrayUnion(itemToAdd),
        });
        return true;
      } else if (itemToAdd) {
        await setDoc(ref, {
          id: interaction.user.id,
          items: arrayUnion(itemToAdd),
        });
        return true;
      } else {
        await interaction.editReply({
          embeds: [
            {
              color: colors.error,
              title: "No item to add",
            },
          ],
          ephemeral: true,
        });
        return false;
      }
    } catch (error) {
      logger(error);
      await interaction.editReply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
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
        const removedItem = data.splice(index, 1)[0];
        await updateDoc(doc(db, "webscraper", userid), {
          items: data,
        });
        return `Removed: ${removedItem.name}`;
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
