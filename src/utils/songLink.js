const { escapeMarkdown } = require("discord.js");

const MAX_NAME = 200;

const safeUrl = (raw) => {
  try {
    const url = new URL(raw);
    return /^https?:$/.test(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

/**
 * Markdown link to a song for embeds. Song names come from YouTube/Spotify, so
 * escape them (they can't break out of the link or add formatting), and only
 * link http(s) URLs.
 */
function songLink(song, { bold = false } = {}) {
  const name = escapeMarkdown(
    String(song.name ?? "Unknown").slice(0, MAX_NAME),
  ).replace(/[[\]]/g, (bracket) => `\\${bracket}`);
  const text = bold ? `**${name}**` : name;
  const url = safeUrl(song.url);
  // encodeURIComponent leaves ( and ) alone, and ) would end the link.
  const href = url?.replaceAll("(", "%28").replaceAll(")", "%29");
  return href ? `[${text}](${href})` : text;
}

module.exports = { safeUrl, songLink };
