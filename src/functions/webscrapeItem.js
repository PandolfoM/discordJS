const { chromium } = require("playwright");

/** Returns the Amazon product title for `url`, or null if it can't be read. */
async function webscrapeItem(url) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    const title = await page
      .locator("#productTitle")
      .first()
      .textContent({ timeout: 10_000 });
    return title?.trim() || null;
  } catch (error) {
    console.error("Error while scraping item title:", error.message);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = webscrapeItem;
