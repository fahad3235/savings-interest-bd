/* Headless-Chrome smoke tests for Savings Interest BD (puppeteer-core + system Chromium). */
"use strict";
const puppeteer = require("puppeteer-core");

const FILE = "file:///home/hatch/workspace/muse-project-factory/builds/savings-interest-bd/index.html";
let pass = 0, fail = 0;
function eq(actual, expected, label) {
  if (actual === expected) { pass++; console.log("  ok:", label); }
  else { fail++; console.error("FAIL:", label, "\n  expected:", JSON.stringify(expected), "\n  actual:  ", JSON.stringify(actual)); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/opt/meta-chromium/chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--allow-file-access-from-files"]
  });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
    page.on("pageerror", e => errors.push("pageerror: " + e.message));
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(FILE, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('[data-i18n="appTitle"]').textContent.length > 0, { timeout: 5000 });

    // 1. default state: DPS tab active, results hidden, compare/history empty
    eq(await page.$eval("#panel-dps", el => el.classList.contains("active")), true, "DPS panel active by default");
    eq(await page.$eval("#dps-results", el => el.hidden), true, "DPS results hidden before calculate");
    eq(await page.$eval("#compare-empty", el => el.hidden), false, "compare empty state visible");

    // 2. DPS calculate with defaults (5000, 36mo, 8%)
    await page.click("#dps-form button[type=submit]");
    await page.waitForFunction(() => !document.getElementById("dps-results").hidden, { timeout: 5000 });
    eq(await page.$eval('[data-result="dps-maturity"]', el => el.textContent), "৳2,04,028.97", "DPS maturity = ৳2,04,028.97");
    eq(await page.$eval('[data-result="dps-invested"]', el => el.textContent), "৳1,80,000.00", "DPS invested = ৳1,80,000.00");
    eq(await page.$eval('[data-result="dps-interest"]', el => el.textContent), "৳24,028.97", "DPS interest = ৳24,028.97");
    const rows = await page.$$eval("#dps-schedule tr", els => els.map(tr => [...tr.children].map(td => td.textContent)));
    eq(rows.length, 3, "3 schedule rows");
    eq(rows[0][0], "Year 1", "schedule row1 label");
    eq(rows[0][2], "৳62,664.63", "schedule y1 maturity");
    eq(rows[2][3], "৳24,028.97", "schedule y3 interest");
    eq(await page.$eval("#history-badge", el => el.textContent), "1", "history badge = 1");

    // 3. validation: empty monthly -> inline error, results hidden
    await page.$eval("#dps-monthly", el => { el.value = ""; });
    await page.click("#dps-form button[type=submit]");
    await page.waitForFunction(() => document.getElementById("err-dps-monthly").classList.contains("show"), { timeout: 5000 });
    eq(await page.$eval("#err-dps-monthly", el => el.textContent), "This field is required.", "empty monthly -> required error");
    eq(await page.$eval("#dps-results", el => el.hidden), true, "results hidden on invalid submit");
    // restore + recalc
    await page.$eval("#dps-monthly", el => { el.value = "5000"; });
    await page.click("#dps-form button[type=submit]");
    await page.waitForFunction(() => !document.getElementById("dps-results").hidden, { timeout: 5000 });

    // 4. save to compare x3 -> badge 3; 4th -> full error
    await page.click("#dps-save"); await page.click("#dps-save"); await page.click("#dps-save");
    await page.waitForFunction(() => document.getElementById("compare-badge").textContent === "3", { timeout: 5000 });
    eq(await page.$eval("#compare-badge", el => el.textContent), "3", "compare badge = 3");
    await page.click("#dps-save");
    await page.waitForFunction(() => document.getElementById("err-dps-save").classList.contains("show"), { timeout: 5000 });
    eq(await page.$eval("#err-dps-save", el => el.textContent),
      "Compare list is full (max 3). Remove one to add another.", "compare-full error shown");
    // compare tab content
    await page.click("#tabbtn-compare");
    const crows = await page.$$eval("#compare-body tr", els => els.length);
    eq(crows, 3, "compare table has 3 rows");
    eq(await page.$$eval("#compare-body tr.best-row", els => els.length), 1, "one best-row highlighted");
    const yield0 = await page.$eval("#compare-body tr td:nth-child(6)", el => el.textContent);
    eq(yield0, "13.35%", "compare yield = 13.35%");
    // remove one -> badge 2; clear -> badge 0, empty visible
    await page.click("#compare-body tr:first-child .mini-btn");
    await page.waitForFunction(() => document.getElementById("compare-badge").textContent === "2", { timeout: 5000 });
    await page.click("#compare-clear");
    await page.waitForFunction(() => !document.getElementById("compare-empty").hidden, { timeout: 5000 });
    eq(await page.$eval("#compare-badge", el => el.textContent), "0", "compare cleared");

    // 5. FDR tab: defaults (100000, 12mo, 9%, simple) -> 1,09,000.00; quarterly -> 1,09,308.33
    await page.click("#tabbtn-dps"); // back (noop sanity)
    await page.click("#tabbtn-fdr");
    await page.click("#fdr-form button[type=submit]");
    await page.waitForFunction(() => !document.getElementById("fdr-results").hidden, { timeout: 5000 });
    eq(await page.$eval('[data-result="fdr-maturity"]', el => el.textContent), "৳1,09,000.00", "FDR simple maturity = ৳1,09,000.00");
    await page.click('input[name="fdr-mode"][value="quarterly"]');
    await page.click("#fdr-form button[type=submit]");
    await page.waitForFunction(
      () => document.querySelector('[data-result="fdr-maturity"]').textContent === "৳1,09,308.33", { timeout: 5000 });
    eq(await page.$eval('[data-result="fdr-maturity"]', el => el.textContent), "৳1,09,308.33", "FDR quarterly maturity = ৳1,09,308.33");

    // 6. history: 2 DPS + 2 FDR calcs = 4; reload persists; delete; clear
    await page.click("#tabbtn-history");
    const hitems = await page.$$eval("#history-list li", els => els.length);
    eq(hitems, 4, "history has 4 entries");
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => document.querySelector('[data-i18n="appTitle"]').textContent.length > 0, { timeout: 5000 });
    await page.click("#tabbtn-history");
    eq(await page.$$eval("#history-list li", els => els.length), 4, "history persists across reload");
    await page.click("#history-list li:first-child .mini-btn");
    await page.waitForFunction(() => document.querySelectorAll("#history-list li").length === 3, { timeout: 5000 });
    eq(await page.$eval("#history-badge", el => el.textContent), "3", "history badge = 3 after delete");
    await page.click("#history-clear");
    await page.waitForFunction(() => !document.getElementById("history-empty").hidden, { timeout: 5000 });
    eq(await page.$eval("#history-badge", el => el.textContent), "0", "history cleared");

    // 7. language toggle -> Bengali, persists
    await page.click("#lang-toggle");
    await page.waitForFunction(
      () => document.querySelector('[data-i18n="appTitle"]').textContent === "সঞ্চয় সুদ বিডি", { timeout: 5000 });
    eq(await page.$eval('[data-i18n="tabDps"]', el => el.textContent), "ডিপিএস", "tab DPS in Bengali");
    eq(await page.evaluate(() => localStorage.getItem("sib-lang")), "bn", "lang persisted to localStorage");
    await page.click("#tabbtn-dps");
    await page.click("#dps-form button[type=submit]");
    await page.waitForFunction(
      () => document.querySelector('[data-result="dps-maturity"]').textContent.includes("২,০৪,০২৮.৯৭"), { timeout: 5000 });
    eq(await page.$eval('[data-result="dps-maturity"]', el => el.textContent), "৳২,০৪,০২৮.৯৭", "Bengali digits maturity");
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(
      () => document.querySelector('[data-i18n="appTitle"]').textContent === "সঞ্চয় সুদ বিডি", { timeout: 5000 });
    eq(await page.$eval("#lang-toggle", el => el.textContent), "English", "lang toggle persists after reload");

    // 8. 390px mobile: no horizontal overflow
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await sleep(400);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    eq(sw <= 391, true, "390px no horizontal overflow (scrollWidth=" + sw + ")");

    // 9. zero console/page errors
    eq(errors.length, 0, "zero console/page errors" + (errors.length ? ": " + errors.join(" | ") : ""));
  } catch (e) {
    fail++;
    console.error("FAIL: exception during smoke test:", e.message);
  } finally {
    await browser.close();
  }
  console.log("\nheadless chrome smoke: " + pass + " passed, " + fail + " failed (" + (pass + fail) + " total)");
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("fatal", e); process.exit(1); });
