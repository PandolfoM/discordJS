const {
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  getDoc,
  setDoc,
} = require("firebase/firestore");
const db = require("../firebaseConfig");

const watchDoc = (userId) => doc(db, "webscraper", userId);

/** Every watched item across all users, as { id: userId, url }. */
async function getUrls() {
  try {
    const snapshot = await getDocs(collection(db, "webscraper"));
    return snapshot.docs.flatMap((userDoc) => {
      const { id, items = [] } = userDoc.data();
      return items.map((item) => ({ id: id ?? userDoc.id, url: item.url }));
    });
  } catch (error) {
    console.error("Failed to load webscraper URLs:", error);
    return [];
  }
}

async function getItems(userId) {
  const snap = await getDoc(watchDoc(userId));
  return snap.exists() ? (snap.data().items ?? []) : [];
}

async function addItem(userId, item) {
  await setDoc(
    watchDoc(userId),
    { id: userId, items: arrayUnion(item) },
    { merge: true },
  );
}

/** Removes every item with this URL. Returns true if anything was removed. */
async function removeUrl(userId, url) {
  const items = await getItems(userId);
  const remaining = items.filter((item) => item.url !== url);
  if (remaining.length === items.length) {
    return false;
  }
  await updateDoc(watchDoc(userId), { items: remaining });
  return true;
}

/** Removes the item at `index`. Returns a user-facing status message. */
async function removeItemNumber(userId, index) {
  const items = await getItems(userId);
  if (index < 0 || index >= items.length) {
    return "That item no longer exists.";
  }
  const [removed] = items.splice(index, 1);
  await updateDoc(watchDoc(userId), { items });
  return `Removed: ${removed.name}`;
}

async function setGuildSetting(guildId, field, value) {
  await setDoc(doc(db, "settings", guildId), { [field]: value }, { merge: true });
}

module.exports = {
  getUrls,
  getItems,
  addItem,
  removeUrl,
  removeItemNumber,
  setGuildSetting,
};
