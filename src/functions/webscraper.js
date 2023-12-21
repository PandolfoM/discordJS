const { chromium } = require("playwright");
const { client } = require("../bot");
const { EmbedBuilder } = require("discord.js");
const colors = require("../config/colors");
const urlShortener = require("../utils/urlShortener");
const { getUrls } = require("../utils/firebaseUtils");
const logger = require("../utils/logger");

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
        { name: "Price", value: `$${price}`, inline: true },
        { name: "Link", value: `${shortUrl}`, inline: true }
      )
      .setImage(`${image}`);
    user.send({ embeds: [embed] });
  } catch (error) {
    logger(error);
  }
}

async function webscrape() {
  (async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const qUrls = await getUrls();

    try {
      for (const urlArr of qUrls) {
        const page = await context.newPage();
        await page.goto(urlArr.url, { waitUntil: "load", timeout: 10000 });
        const titleElement = await page.waitForSelector("#productTitle");
        const priceElement = await page.waitForSelector(".a-price-whole");
        const imageElement = await page.waitForSelector("#landingImage");
        const priceFractionElement = await page.waitForSelector(
          ".a-price-fraction"
        );
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
        if (previousPrices[urlArr.url] !== undefined) {
          if (price < previousPrices[urlArr.url]) {
            // Price has gone down
            sendDM(urlArr.id, title.trim(), price, image, urlArr.url, true);
          } else if (price > previousPrices[urlArr.url]) {
            // Price has gone up
            sendDM(urlArr.id, title.trim(), price, image, urlArr.url, false);
          }
        }
        previousPrices[urlArr.url] = price;
      }
    } catch (error) {
      console.error("Error while scraping:", error);
    } finally {
      await browser.close();
    }
  })();
}

setInterval(webscrape, 1800 * 1000);

module.exports = webscrape;
