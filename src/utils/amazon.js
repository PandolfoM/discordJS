const SHORT_HOSTS = new Set(["a.co", "amzn.to"]);

/** True for amazon.com (and subdomains) or Amazon's short-link hosts. */
function isAmazonUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      SHORT_HOSTS.has(host) ||
      host === "amazon.com" ||
      host.endsWith(".amazon.com")
    );
  } catch {
    return false;
  }
}

module.exports = { isAmazonUrl };
