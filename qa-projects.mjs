import fs from "node:fs";

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok_full.txt", "utf8")
  .trim();

export default async function run(page, ui) {
  const report = {};

  // ---------------------------------------------------
  // Seed the JWT the same way a real login would
  // ---------------------------------------------------
  await page.goto("http://localhost:5173/");
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, TOKEN);

  // ---------------------------------------------------
  // Load the Projects page and wait for real content
  // ---------------------------------------------------
  const apiCalls = [];
  page.on("response", (res) => {
    if (res.url().includes("/api/projects")) {
      apiCalls.push(`${res.status()} ${res.url()}`);
    }
  });

  await page.goto("http://localhost:5173/projects");

  // Wait for either a card or the empty state.
  await page
    .waitForSelector(".project-card, .projects-state", { timeout: 20000 })
    .catch(() => { });

  await page.waitForTimeout(1500);

  report.apiCalls = apiCalls;
  report.url = page.url();

  // ---------------------------------------------------
  // What actually rendered?
  // ---------------------------------------------------
  report.cards = await page.evaluate(() =>
    [...document.querySelectorAll(".project-card")].map((card) => ({
      title: card.querySelector("h2")?.innerText?.trim(),
      statusPillClass:
        card.querySelector(".project-status")?.className,
      statusText:
        card.querySelector(".project-status")?.innerText?.trim(),
      stats: [...card.querySelectorAll(".project-card__stats > span")].map(
        (s) => s.innerText.replace(/\s+/g, " ").trim()
      ),
      footer: card
        .querySelector(".project-card__footer")
        ?.innerText?.replace(/\s+/g, " ")
        .trim(),
    }))
  );

  report.stateText = await page.evaluate(() => {
    const el = document.querySelector(
      ".projects-state, .projects-empty"
    );
    return el ? el.innerText.replace(/\s+/g, " ").trim() : null;
  });

  report.gridPresent = await page.evaluate(
    () => !!document.querySelector(".projects-grid")
  );

  // ---------------------------------------------------
  // Does the toolbar default to "All Status"?
  // ---------------------------------------------------
  report.statusOptions = await page.evaluate(() => {
    const sel = document.querySelector(".projects-toolbar select");
    return sel ? [...sel.options].map((o) => o.value) : null;
  });

  report.statusSelected = await page.evaluate(() => {
    const sel = document.querySelector(".projects-toolbar select");
    return sel ? sel.value : null;
  });

  // ---------------------------------------------------
  // Search box exists and is bound
  // ---------------------------------------------------
  report.hasSearch = await page.evaluate(
    () => !!document.querySelector(".projects-search input")
  );

  return report;
}