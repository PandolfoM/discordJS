const { chromium } = require("playwright");
const { client } = require("../bot");
const logger = require("../utils/logger");
const getUrls = require("../utils/firebaseUtils");
const { EmbedBuilder } = require("discord.js");
const colors = require("../config/colors");
const urlShortener = require("../utils/urlShortener");

const previousPrices = {};

async function sendDM(userid, item, price, image, url, drop) {
  try {
    const user = await client.users.fetch(userid);
    const shortUrl = await urlShortener(url);
    const embed = new EmbedBuilder()
      .setColor(drop ? colors.success : colors.error)
      .setTitle(drop ? "Price Drop!" : "Price Increase :(")
      .addFields(
        { name: "Item", value: `${item}` },
        { name: "Price", value: `${price}`, inline: true },
        { name: "Link", value: `https://${shortUrl}`, inline: true }
      )
      .setImage(`${image}`);
    user.send({ embeds: [embed] });
  } catch (e) {
    logger(e);
  }
}

async function webscrape() {
  (async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const qUrls = await getUrls();

    try {
      for (const urlObj of qUrls) {
        const id = urlObj.id;
        const urls = urlObj.urls;
        for (const url of urls) {
          const page = await context.newPage();
          await page.goto(url);

          const titleElement = await page.$("#productTitle");
          const priceElement = await page.$(".a-price-whole");
          const imageElement = await page.$("#landingImage");
          const priceFractionElement = await page.$(".a-price-fraction");

          if (
            !titleElement ||
            !priceElement ||
            !priceFractionElement ||
            !imageElement
          ) {
            continue;
          }

          const title = await titleElement.textContent();
          const wholePart = await priceElement.textContent();
          const fractionPart = await priceFractionElement.textContent();
          const image = await imageElement.getAttribute("src");
          const price = parseFloat(
            `${wholePart.replace(/,/g, "")}${fractionPart}`
          );

          if (previousPrices[url] !== undefined) {
            if (price < previousPrices[url]) {
              // Price has gone down
              sendDM(id, title.trim(), price, image, url, true);
            } else if (price > previousPrices[url]) {
              // Price has gone up
              sendDM(id, title.trim(), price, image, url, false);
            }
          }

          previousPrices[url] = price;
        }
      }
    } catch (error) {
      console.error("Error while scraping:", error);
    } finally {
      await browser.close();
    }
  })();
}

module.exports = webscrape;
