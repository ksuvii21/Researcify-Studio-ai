import fs from "node:fs";

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok.txt", "utf8")
  .trim();

const log = [];
const say = (m) => {
  log.push(m);
};

export default async function run(page, ui) {
  const seen = [];
  page.on("response", (res) => {
    if (res.url().includes("/api/v1/projects")) {
      seen.push(`${res.status()} ${res.url().replace(/^.*\/projects/, "/projects")}`);
    }
  });

  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  // ---------- 1. log in via seeded token ----------
  await page.goto("http://localhost:5173/");
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, TOKEN);
  say("1. token seeded");

  // ---------- 2/3. open /projects, confirm real data ----------
  await page.goto("http://localhost:5173/projects");
  await page.waitForSelector(".project-card, .projects-state", { timeout: 25000 });
  await page.waitForTimeout(1500);
  const before = await page.locator(".project-card").count();
  say(`2-3. /projects loaded, ${before} card(s) from MongoDB`);

  // ---------- 6. create "RAG Research Test" via the modal ----------
  await page.getByRole("button", { name: /new project/i }).first().click();
  await page.waitForSelector(".app-modal", { timeout: 10000 });
  await page.locator("#project-form-title").fill("RAG Research Test");
  await page
    .locator("#project-form-question")
    .fill("How does retrieval augmented generation reduce hallucination?");
  await page
    .locator("#project-form-description")
    .fill("Temporary project for the Phase 8A live test.");
  await page.getByRole("button", { name: /create project/i }).click();
  await page.waitForTimeout(2500);

  const afterCreate = await page.locator(".project-card").count();
  say(`6. created "RAG Research Test" (cards ${before} -> ${afterCreate})`);

  // ---------- 7. refresh, must still exist ----------
  await page.reload();
  await page.waitForSelector(".project-card", { timeout: 25000 });
  await page.waitForTimeout(1500);
  const persisted = await page
    .locator(".project-card h2")
    .allInnerTexts();
  say(`7. after refresh: ${JSON.stringify(persisted)}`);

  // ---------- 8. edit to "Advanced RAG Research" ----------
  await page
    .locator(".project-card")
    .filter({ hasText: "RAG Research Test" })
    .locator(".project-card__menu")
    .click();
  await page.waitForTimeout(400);
  await page.getByRole("menuitem", { name: /edit project/i }).click();
  await page.waitForSelector(".app-modal", { timeout: 10000 });
  await page.waitForTimeout(400);
  const prefilled = await page.locator("#project-form-title").inputValue();
  await page.locator("#project-form-title").fill("Advanced RAG Research");
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.waitForTimeout(2500);
  say(`8. edit modal prefilled with "${prefilled}", renamed to "Advanced RAG Research"`);

  // ---------- 9. refresh, updated name persists ----------
  await page.reload();
  await page.waitForSelector(".project-card", { timeout: 25000 });
  await page.waitForTimeout(1500);
  say(
    `9. after refresh: ${JSON.stringify(
      await page.locator(".project-card h2").allInnerTexts()
    )}`
  );

  // ---------- 10/11. click -> detail from API ----------
  await page
    .locator(".project-card")
    .filter({ hasText: "Advanced RAG Research" })
    .locator(".project-card__footer button")
    .click();
  await page.waitForTimeout(2500);
  const detailUrl = page.url();
  const detail = await page.evaluate(() => {
    const panel = (heading) =>
      [...document.querySelectorAll(".project-panel")].find((p) =>
        p.querySelector("h2")?.innerText?.toLowerCase().includes(heading)
      );
    const stat = (label) =>
      [...document.querySelectorAll(".project-overview-stat")].find((s) =>
        s.querySelector("p")?.innerText?.toLowerCase().includes(label)
      )?.querySelector("strong")?.innerText;
    return {
      h1: document.querySelector(".project-detail-header h1")?.innerText,
      description: document
        .querySelector(".project-detail-header__main p")
        ?.innerText,
      question: panel("research question")?.querySelector(
        ".project-panel__question"
      )?.innerText,
      info: [...document.querySelectorAll(".project-detail-info > div")].map(
        (d) => d.innerText.replace(/\s+/g, " ").trim()
      ),
      papers: stat("paper"),
      documents: stat("document"),
      notes: stat("note"),
      hasErrorState: !!document.querySelector(".project-detail-state"),
    };
  });
  say(`10. clicked card -> ${detailUrl}`);
  say(`11. detail rendered: ${JSON.stringify(detail)}`);

  // ---------- 12/13/14. dashboard ----------
  await page.goto("http://localhost:5173/dashboard");
  await page.waitForSelector(".dashboard-home", { timeout: 25000 });
  await page.waitForTimeout(4000);
  const dash = await page.evaluate(() => {
    const overview = [
      ...document.querySelectorAll(".overview-card"),
    ].map((c) => ({
      label: c.querySelector(".overview-card__label")?.innerText,
      value: c.querySelector(".overview-card__value")?.innerText,
      note: c.querySelector("small")?.innerText,
    }));
    return {
      overview,
      recent: [...document.querySelectorAll(".dashboard-projects .project-card h3")].map(
        (h) => h.innerText
      ),
      continueTitle: document.querySelector(
        ".continue-research__project h3"
      )?.innerText,
    };
  });
  say(`12-14. dashboard: ${JSON.stringify(dash)}`);

  // ---------- 15. delete ----------
  let dialogMessage = null;
  page.on("dialog", async (d) => {
    dialogMessage = d.message();
    await d.accept();
  });

  await page.goto("http://localhost:5173/projects");
  await page.waitForSelector(".project-card", { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page
    .locator(".project-card")
    .filter({ hasText: "Advanced RAG Research" })
    .locator(".project-card__menu")
    .click();
  await page.waitForTimeout(400);
  await page.getByRole("menuitem", { name: /delete project/i }).click();
  await page.waitForTimeout(2500);
  say(`15. confirm dialog: "${dialogMessage}"`);
  say(
    `15. after delete: ${JSON.stringify(
      await page.locator(".project-card h2").allInnerTexts()
    )}`
  );

  // ---------- 16/17. refresh, stays deleted ----------
  await page.reload();
  await page.waitForTimeout(2500);
  say(
    `16-17. after refresh: ${JSON.stringify(
      await page.locator(".project-card h2").allInnerTexts()
    )}`
  );

  return {
    steps: log,
    consoleErrors,
    apiCalls: seen,
  };
}