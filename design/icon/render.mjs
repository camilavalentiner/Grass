import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1700, height: 600 }, deviceScaleFactor: 2 });
await page.goto("file://" + process.cwd() + "/icons.html");
await page.waitForTimeout(400);
for (const id of ["daisy", "blade", "book"]) await page.locator("#" + id).screenshot({ path: `${id}-1024.png` });
await browser.close(); console.log("rendered");
