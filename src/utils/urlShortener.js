const axios = require("axios");
const logger = require("./logger");

async function urlShortener(url) {
  try {
    const response = await axios.post(
      "https://api-ssl.bitly.com/v4/shorten",
      {
        long_url: url,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BITLYACCESSTOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.id;
  } catch (error) {
    logger("Error shortening URL:", error.message);
    return url;
  }
}

module.exports = urlShortener;
