const { chromium } = require("playwright");
const { client } = require("../bot");
const logger = require("../utils/logger");

const previousPrices = {};

function sendDM(userid, message) {
  try {
    client.users.send(userid, message);
  } catch (error) {
    logger(error);
  }
}

async function webscrape() {
  (async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const urls = ["https://a.co/d/aLnWU73", "https://a.co/d/7MfasAb"];

    try {
      for (const url of urls) {
        const page = await context.newPage();
        await page.goto(url);

        const titleElement = await page.$("#productTitle");
        const priceElement = await page.$(".a-price-whole");
        const priceFractionElement = await page.$(".a-price-fraction");

        const title = await titleElement.textContent();
        const wholePart = await priceElement.textContent();
        const fractionPart = await priceFractionElement.textContent();
        const price = parseFloat(
          `${wholePart.replace(/,/g, "")}${fractionPart}`
        );

        if (previousPrices[url] !== undefined) {
          if (price < previousPrices[url]) {
            console.log(
              `${title.trim()} price has dropped! New price: $${price}`
            );
            sendDM(
              "248910149442338816",
              `${title.trim()} price dropped! New price: $${price}`
            );
          } else if (price > previousPrices[url]) {
            console.log(
              `${title.trim()} price has increased. New price: $${price}`
            );
            sendDM(
              "248910149442338816",
              `${title.trim()} has gone up. New price: $${price}`
            );
          } else {
            console.log(`${title.trim()} price is the same $${price}`);
          }
        }

        previousPrices[url] = price;
      }
    } catch (error) {
      console.error("Error while scraping:", error);
    } finally {
      console.log(previousPrices);
      await browser.close();
    }
  })();
}

module.exports = webscrape;
