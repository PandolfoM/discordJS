const axios = require("axios");

const ALREADY_SHORT_HOSTS = new Set(["a.co", "amzn.to", "bit.ly"]);
const cache = new Map();

async function urlShortener(url) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return url;
  }

  if (ALREADY_SHORT_HOSTS.has(host) || !process.env.BITLYACCESSTOKEN) {
    return url;
  }
  if (cache.has(url)) {
    return cache.get(url);
  }

  try {
    const { data } = await axios.post(
      "https://api-ssl.bitly.com/v4/shorten",
      { long_url: url },
      {
        headers: {
          Authorization: `Bearer ${process.env.BITLYACCESSTOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10_000,
      },
    );
    const shortUrl = data.link ?? `https://${data.id}`;
    cache.set(url, shortUrl);
    return shortUrl;
  } catch (error) {
    console.log("Error shortening URL:", error.message);
    return url;
  }
}

module.exports = urlShortener;
