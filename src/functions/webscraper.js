const { chromium } = require("playwright");
const { EmbedBuilder } = require("discord.js");
const colors = require("../config/colors");
const urlShortener = require("../utils/urlShortener");
const { getAllWatchedItems } = require("../db/watchlist");
const logger = require("../utils/logger");

const INITIAL_DELAY_MS = 60 * 1000;
const INTERVAL_MS = 30 * 60 * 1000;

/** Last seen price per URL (null = unavailable). */
const previousPrices = new Map();
let running = false;

const digits = (text) => (text ?? "").replace(/\D/g, "");

async function scrapeProduct(page, url) {
  await page.goto(url, { waitUntil: "load", timeout: 30_000 });
  const title = await page
    .locator("#productTitle")
    .first()
    .textContent({ timeout: 10_000 });

  const priceBlock = page.locator(".priceToPay").first();
  if (!(await priceBlock.count())) {
    return { title: title.trim(), price: null };
  }

  const whole = await priceBlock.locator(".a-price-whole").first().textContent();
  const fraction = await priceBlock
    .locator(".a-price-fraction")
    .first()
    .textContent();
  const image = await page
    .locator("#landingImage")
    .first()
    .getAttribute("src", { timeout: 5_000 })
    .catch(() => null);

  const price = parseFloat(`${digits(whole)}.${digits(fraction) || "0"}`);
  return { title: title.trim(), price: Number.isNaN(price) ? null : price, image };
}

async function sendPriceAlerts(client, userIds, { title, price, image, url, drop }) {
  const embed = new EmbedBuilder()
    .setColor(drop ? colors.success : colors.error)
    .setTitle(drop ? "Price Drop!" : "Price Increase :(")
    .addFields(
      { name: "Item", value: title },
      { name: "Price", value: `$${price.toFixed(2)}`, inline: true },
      { name: "Link", value: await urlShortener(url), inline: true },
    );
  if (image) {
    embed.setImage(image);
  }

  await Promise.all(
    [...userIds].map(async (userId) => {
      try {
        const user = await client.users.fetch(userId);
        await user.send({ embeds: [embed] });
      } catch (error) {
        logger(error);
      }
    }),
  );
}

async function webscrape(client) {
  if (running) {
    return;
  }
  running = true;
  let browser;

  try {
    // Group watchers by URL so each product page is scraped once per run.
    const watchers = new Map();
    for (const { userId, url } of getAllWatchedItems()) {
      if (!watchers.has(url)) {
        watchers.set(url, new Set());
      }
      watchers.get(url).add(userId);
    }

    for (const url of previousPrices.keys()) {
      if (!watchers.has(url)) {
        previousPrices.delete(url);
      }
    }
    if (!watchers.size) {
      return;
    }

    browser = await chromium.launch();
    const page = await browser.newPage();

    for (const [url, userIds] of watchers) {
      try {
        const { title, price, image } = await scrapeProduct(page, url);
        const previous = previousPrices.get(url);
        previousPrices.set(url, price);

        if (price === null) {
          console.log("Unavailable:", url);
        } else if (previous != null && price !== previous) {
          await sendPriceAlerts(client, userIds, {
            title,
            price,
            image,
            url,
            drop: price < previous,
          });
        }
      } catch (error) {
        console.error(`Error while scraping ${url}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Webscraper run failed:", error);
  } finally {
    await browser?.close();
    running = false;
  }
}

function startWebscraper(client) {
  setTimeout(() => {
    webscrape(client);
    setInterval(() => webscrape(client), INTERVAL_MS);
  }, INITIAL_DELAY_MS);
}

module.exports = { webscrape, startWebscraper };
