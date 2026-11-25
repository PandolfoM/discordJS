const db = require("./index");

const statements = {
  all: db.prepare("SELECT user_id AS userId, url FROM watched_items"),
  byUser: db.prepare(
    "SELECT id, url, name FROM watched_items WHERE user_id = ? ORDER BY id",
  ),
  upsert: db.prepare(`
    INSERT INTO watched_items (user_id, url, name) VALUES (?, ?, ?)
    ON CONFLICT (user_id, url) DO UPDATE SET name = excluded.name
  `),
  deleteByUrl: db.prepare("DELETE FROM watched_items WHERE user_id = ? AND url = ?"),
  deleteById: db.prepare(
    "DELETE FROM watched_items WHERE id = ? AND user_id = ? RETURNING name",
  ),
};

/** Every watched item across all users, as { userId, url }. */
const getAllWatchedItems = () => statements.all.all();

/** A user's items, oldest first, as { id, url, name }. */
const getItems = (userId) => statements.byUser.all(userId);

/** Adds an item, or renames it if the user already watches that URL. */
function addItem(userId, { url, name }) {
  statements.upsert.run(userId, url, name);
}

/** Returns true if the URL was being watched. */
function removeUrl(userId, url) {
  return statements.deleteByUrl.run(userId, url).changes > 0;
}

/** Returns the removed item's name, or null if it no longer exists. */
function removeItem(userId, itemId) {
  return statements.deleteById.get(itemId, userId)?.name ?? null;
}

module.exports = { getAllWatchedItems, getItems, addItem, removeUrl, removeItem };
