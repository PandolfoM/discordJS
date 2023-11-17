const { chromium } = require("playwright");

async function webscrapeItem(itemUrl) {
  return (async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      await page.goto(itemUrl);

      const titleElement = await page.$("#productTitle");
      const title = await titleElement.textContent();

      return title.trim();
    } catch (error) {
      console.error("Error while scraping:", error);
    } finally {
      await browser.close();
    }
  })();
}

module.exports = webscrapeItem;
