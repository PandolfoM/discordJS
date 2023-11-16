const axios = require("axios");

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

    return `https://${response.data.id}`;
  } catch (error) {
    console.log("Error shortening URL:", error.message);
    return url;
  }
}

module.exports = urlShortener;
