import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 600, height: 600 }, deviceScaleFactor: 2 });
await page.goto("file://" + process.cwd() + "/daisy-circle.html"); await page.waitForTimeout(300);
await page.locator("#daisy-circle").screenshot({ path: "daisy-circle-1024.png" });
await browser.close(); console.log("rendered");
