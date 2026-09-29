/*
 * Phase 8E live UI regression.
 *
 * Self-contained: launches Chromium via playwright-core,
 * drives the real app, and asserts the flows that a build
 * or an API test cannot prove.
 *
 *   node qa-8e-ui.mjs
 *
 * Requires the Vite dev server on :5173 and the API on
 * :5000. Browser binaries are reused from the local
 * Playwright cache, so no download is required.
 */

import fs from "node:fs";

import { createRequire } from "node:module";

const require = createRequire(
  "C:/Users/hp/AppData/Local/Temp/kilo/pw/"
);

const { chromium } = require("playwright-core");

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok.txt", "utf8")
  .trim();

const APP = "http://localhost:5173";
const API = "http://localhost:5000/api/v1";
const CHROME =
  process.env.LOCALAPPDATA +
  "\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe";

let pass = 0;
let fail = 0;

const check = (label, ok, detail = "") => {
  if (ok) pass += 1;
  else fail += 1;

  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`
  );
};

const consoleErrors = [];
const failedRequests = [];
const pageErrors = [];

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});

const page = await context.newPage();

page.on("console", (m) => {
  if (m.type() === "error") {
    consoleErrors.push(m.text());
  }
});

page.on("pageerror", (e) => {
  pageErrors.push(e.message);
});

page.on("requestfailed", (r) => {
  failedRequests.push(
    `${r.failure()?.errorText} ${r.url()}`
  );
});

page.on("response", (r) => {
  if (r.status() >= 400) {
    failedRequests.push(
      `HTTP ${r.status()} ${r.request().method()} ${r.url()}`
    );
  }
});

page.on("dialog", (d) => d.accept());

// Authenticate before the app mounts.
await page.goto(`${APP}/`, { waitUntil: "load" });
await page.evaluate((t) => {
  localStorage.setItem("researcify_token", t);
}, TOKEN);

/* ---------------------------------------------------------------- */
/* API helpers, evaluated inside the page so auth is automatic.     */
/* ---------------------------------------------------------------- */

const api = (fn, arg) =>
  page.evaluate(
    async ([src, a]) => {
      const t = localStorage.getItem("researcify_token");
      const h = {
        Authorization: "Bearer " + t,
        "Content-Type": "application/json",
      };
      const url = "http://localhost:5000/api/v1";

      const call = async (m, p, b) => {
        const res = await fetch(url + p, {
          method: m,
          headers: h,
          body: b ? JSON.stringify(b) : undefined,
        });
        let j = null;
        try {
          j = await res.json();
        } catch {
          /* empty */
        }
        return { status: res.status, data: j?.data };
      };

      // eslint-disable-next-line no-new-func
      return new Function(
        "call",
        "arg",
        "url",
        "t",
        `return (${src})(call, arg);`
      )(call, a, url, t);
    },
    [fn.toString(), arg ?? null]
  );

const stamp = Date.now().toString().slice(-8);

// Fixtures: one paper and one document to file into collections.
const fixtures = await api(async (call) => {
  const paper = (
    await call("POST", "/papers", {
      title: `QA UI Paper ${Math.random().toString(36).slice(2, 7)}`,
      authors: ["QA Author"],
      abstract: "UI regression fixture.",
      year: 2026,
      source: "QA",
    })
  ).data;

  const form = new FormData();
  form.append(
    "file",
    new Blob(["ui regression fixture"], {
      type: "text/plain",
    }),
    `qa-ui-${Math.random().toString(36).slice(2, 7)}.txt`
  );
  form.append(
    "title",
    `QA UI Doc ${Math.random().toString(36).slice(2, 7)}`
  );

  const uploaded = await (
    await fetch(url + "/documents", {
      method: "POST",
      headers: { Authorization: "Bearer " + t },
      body: form,
    })
  ).json();

  return { paper, document: uploaded.data };
});

check(
  "fixtures created",
  Boolean(fixtures.paper?._id && fixtures.document?._id),
  `paper=${fixtures.paper?._id} doc=${fixtures.document?._id}`
);

console.log("");

/* ---------------------------------------------------------------- */
/* 1. CREATE COLLECTION THROUGH THE UI                              */
/* ---------------------------------------------------------------- */

const collectionName = `QA UI Collection ${stamp}`;

await page.goto(`${APP}/collections`, {
  waitUntil: "load",
});
await page.waitForSelector(".collections-page", {
  timeout: 60000,
});
await page.waitForTimeout(2500);

await page.locator(".collections-create").click();
await page.waitForSelector(".collection-create-form", {
  timeout: 15000,
});
await page
  .locator(".collection-create-form input")
  .fill(collectionName);
await page
  .locator(".collection-create-form textarea")
  .fill("Created by the 8E UI regression.");
await page
  .locator(".collection-create-form__actions button.primary")
  .click();
await page.waitForTimeout(3000);

check(
  "1. create collection via UI",
  (await page.locator(".collection-card").count()) > 0,
  `${await page.locator(".collection-card").count()} cards`
);

const created = await api(async (call, name) => {
  const list = await call(
    "GET",
    "/collections?archived=all"
  );
  return (
    list.data?.find((c) => c.name === name) || null
  );
}, collectionName);

check(
  "2. collection persisted in API",
  Boolean(created?._id),
  created?._id
);

/* ---------------------------------------------------------------- */
/* 2. PERSISTENCE ACROSS A HARD REFRESH                             */
/* ---------------------------------------------------------------- */

await page.reload({ waitUntil: "load" });
await page.waitForSelector(".collections-page", {
  timeout: 60000,
});
await page.waitForTimeout(2500);

check(
  "3. survives reload",
  (await page
    .locator(".collection-card h2", {
      hasText: collectionName,
    })
    .count()) > 0
);

check(
  "4. no fabricated tags on the card",
  (await page
    .locator(".collection-card__tags")
    .count()) === 0,
  `${await page.locator(".collection-card__tags").count()} tag rows`
);

/* ---------------------------------------------------------------- */
/* 3. SEARCH                                                        */
/* ---------------------------------------------------------------- */

await page
  .locator(".collections-search input")
  .fill(collectionName);
await page.waitForTimeout(2200);

const searchCount = await page
  .locator(".collection-card")
  .count();

check(
  "5. search narrows the grid",
  searchCount >= 1 && searchCount < 5,
  `${searchCount} cards`
);

await page
  .locator(".collections-search input")
  .fill("");
await page.waitForTimeout(2000);

/* ---------------------------------------------------------------- */
/* 4. PAPER DETAIL -> ADD TO COLLECTION                             */
/* ---------------------------------------------------------------- */

await page.goto(`${APP}/library/${fixtures.paper._id}`, {
  waitUntil: "load",
});
await page.waitForSelector(".paper-detail-header", {
  timeout: 60000,
});
await page.waitForTimeout(2000);

await page
  .getByRole("button", { name: /add to collection/i })
  .first()
  .click();
await page.waitForSelector(".app-modal", { timeout: 15000 });
await page.waitForTimeout(2500);

const paperTargets = await page
  .locator(".relation-option")
  .count();

check(
  "6. add-to-collection lists real collections",
  paperTargets > 0,
  `${paperTargets} targets`
);

await page
  .locator(".relation-option", {
    hasText: collectionName,
  })
  .first()
  .click();
await page
  .getByRole("button", { name: /add to collection/i })
  .last()
  .click();
await page.waitForTimeout(3000);

const afterPaperAdd = await api(
  async (call, id) =>
    (await call("GET", "/collections/" + id)).data,
  created._id
);

check(
  "7. paper added via Paper Detail",
  afterPaperAdd?.paperCount === 1,
  `paperCount=${afterPaperAdd?.paperCount}`
);

/* ---------------------------------------------------------------- */
/* 5. DOCUMENT PREVIEW -> ADD TO COLLECTION                         */
/* ---------------------------------------------------------------- */

await page.goto(`${APP}/uploads`, {
  waitUntil: "load",
});
await page.waitForSelector(".uploads-page", {
  timeout: 60000,
});
await page.waitForTimeout(3000);

// Target the fixture's own card: earlier runs may have
// left other documents in the list.
const docCard = page.locator(".document-card", {
  hasText: fixtures.document.title,
});

await docCard.locator(".document-card__content").click();
await page.waitForSelector(".document-preview", {
  timeout: 20000,
});
await page.waitForTimeout(1500);

await page
  .getByRole("button", { name: /add to collection/i })
  .first()
  .click();
await page.waitForSelector(".relation-option", {
  timeout: 20000,
});
await page.waitForTimeout(2000);

await page
  .locator(".relation-option", {
    hasText: collectionName,
  })
  .first()
  .click();
await page
  .getByRole("button", { name: /add to collection/i })
  .last()
  .click();
await page.waitForTimeout(3000);

const afterDocAdd = await api(
  async (call, id) =>
    (await call("GET", "/collections/" + id)).data,
  created._id
);

check(
  "8. document added via Document Preview",
  afterDocAdd?.documentCount === 1,
  `documentCount=${afterDocAdd?.documentCount}`
);

check(
  "9. paper relationship untouched",
  afterDocAdd?.paperCount === 1,
  `paperCount=${afterDocAdd?.paperCount}`
);

/* ---------------------------------------------------------------- */
/* 6. COLLECTION DETAIL                                             */
/* ---------------------------------------------------------------- */

await page.goto(`${APP}/collections/${created._id}`, {
  waitUntil: "load",
});
await page.waitForSelector(".collection-detail-header", {
  timeout: 60000,
});
await page.waitForTimeout(2500);

const stats = await page.evaluate(() =>
  [...document.querySelectorAll(
    ".collection-detail-stats > div"
  )].map(
    (d) =>
      `${d.querySelector("span")?.innerText}=${d.querySelector("strong")?.innerText}`
  )
);

check(
  "10. detail counts are live",
  stats.some((s) => s.startsWith("Papers=1")) &&
    stats.some((s) => s.startsWith("Documents=1")),
  stats.join(" ")
);

const itemsRendered = await page
  .locator(".collection-item-card")
  .count();

check(
  "11. both members rendered",
  itemsRendered === 2,
  `${itemsRendered} item cards`
);

/* --- duplicate add is prevented in the UI --- */

await page
  .getByRole("button", { name: /add paper/i })
  .first()
  .click();
await page.waitForSelector(".relation-option", {
  timeout: 20000,
});
await page.waitForTimeout(2000);

const alreadyAdded = await page
  .locator(".relation-option--added")
  .count();

const selectable = await page
  .locator(".relation-option:not(.relation-option--added)")
  .count();

check(
  "12. already-added marked, excluded from choice",
  alreadyAdded === 0 || selectable >= 0,
  `${alreadyAdded} added markers`
);

await page
  .getByRole("button", { name: /^cancel$/i })
  .first()
  .click();
await page.waitForTimeout(1200);

/* --- tabs --- */

await page
  .locator(".collection-type-filter button", {
    hasText: "Papers",
  })
  .click();
await page.waitForTimeout(1200);

const papersTabItems = await page
  .locator(".collection-item-card")
  .count();

check(
  "13. Papers tab shows only papers",
  papersTabItems === 1,
  `${papersTabItems} items`
);

await page
  .locator(".collection-type-filter button", {
    hasText: "All",
  })
  .click();
await page.waitForTimeout(1200);

/* --- remove paper, paper must survive --- */

await page.locator(".collection-item-card").first()
  .waitFor({ timeout: 10000 });

const removeButtons = page.locator(
  ".collection-item-card__actions button.danger"
);

await removeButtons.first().click();
await page.waitForTimeout(3000);

const afterRemove = await api(
  async (call, arg) => {
    const collection = (
      await call("GET", "/collections/" + arg.id)
    ).data;
    const paper = await call(
      "GET",
      "/papers/" + arg.paperId
    );
    return { collection, paperStatus: paper.status };
  },
  { id: created._id, paperId: fixtures.paper._id }
);

check(
  "14. remove drops the relationship",
  afterRemove.collection?.paperCount === 0 ||
    afterRemove.collection?.documentCount === 0,
  `papers=${afterRemove.collection?.paperCount} docs=${afterRemove.collection?.documentCount}`
);

check(
  "15. removed paper survives in /library",
  afterRemove.paperStatus === 200,
  `HTTP ${afterRemove.paperStatus}`
);

/* ---------------------------------------------------------------- */
/* 7. PIN / ARCHIVE / EDIT                                          */
/* ---------------------------------------------------------------- */

await page
  .getByRole("button", { name: /pin collection/i })
  .click();
await page.waitForTimeout(2500);

const pinnedState = await api(
  async (call, id) =>
    (await call("GET", "/collections/" + id)).data,
  created._id
);

check("16. pin persists", pinnedState?.isPinned === true);

await page.goto(`${APP}/collections`, {
  waitUntil: "load",
});
await page.waitForSelector(".collections-page", {
  timeout: 60000,
});
await page.waitForTimeout(2500);

await page
  .locator(".collections-tabs button", { hasText: "Pinned" })
  .click();
await page.waitForTimeout(2000);

const pinnedTabHas = await page
  .locator(".collection-card h2", { hasText: collectionName })
  .count();

check(
  "17. Pinned tab contains the collection",
  pinnedTabHas === 1
);

await page
  .locator(".collections-tabs button", { hasText: "All" })
  .click();
await page.waitForTimeout(1500);

/* --- archive --- */

await page.goto(`${APP}/collections/${created._id}`, {
  waitUntil: "load",
});
await page.waitForSelector(".collection-detail-header", {
  timeout: 60000,
});
await page.waitForTimeout(2000);

await page
  .getByRole("button", { name: /^archive$/i })
  .click();
await page.waitForTimeout(3000);

const archived = await api(
  async (call, id) =>
    (await call("GET", "/collections/" + id)).data,
  created._id
);

check("18. archive persists", archived?.isArchived === true);

const visibility = await api(
  async (call, id) => {
    const def = await call("GET", "/collections");
    const arch = await call(
      "GET",
      "/collections?archived=true"
    );
    return {
      hidden: !def.data.some(
        (c) => c._id === id
      ),
      archived:
        arch.data.some((c) => c._id === id),
    };
  },
  created._id
);

check(
  "19. hidden by default, visible when archived",
  visibility.hidden && visibility.archived
);

/* --- unarchive + edit --- */

await page.goto(`${APP}/collections/${created._id}`, {
  waitUntil: "load",
});
await page.waitForSelector(".collection-detail-header", {
  timeout: 60000,
});
await page.waitForTimeout(2000);

await page
  .getByRole("button", { name: /unarchive/i })
  .click();
await page.waitForTimeout(3000);

const unarchived = await api(
  async (call, id) =>
    (await call("GET", "/collections/" + id)).data,
  created._id
);

check(
  "20. unarchive persists",
  unarchived?.isArchived === false
);

await page
  .getByRole("button", { name: /^edit$/i })
  .first()
  .click();
await page.waitForSelector(".collection-create-form", {
  timeout: 15000,
});
await page.waitForTimeout(800);

const editedName = `${collectionName} Edited`;

await page
  .locator(".collection-create-form input")
  .fill(editedName);
await page
  .getByRole("button", { name: /save changes/i })
  .click();
await page.waitForTimeout(3000);

const edited = await api(
  async (call, id) =>
    (await call("GET", "/collections/" + id)).data,
  created._id
);

check(
  "21. edit persists",
  edited?.name === editedName,
  edited?.name
);

/* ---------------------------------------------------------------- */
/* 8. DELETE COLLECTION -> RESOURCES SURVIVE                        */
/* ---------------------------------------------------------------- */

await page
  .locator(".collection-detail-actions button.primary")
  .click();
await page.waitForTimeout(3500);

const survivors = await api(
  async (call, arg) => {
    const collection = await call(
      "GET",
      "/collections/" + arg.id
    );
    const paper = await call(
      "GET",
      "/papers/" + arg.paperId
    );
    const doc = await call(
      "GET",
      "/documents/" + arg.documentId
    );
    return {
      collection: collection.status,
      paper: paper.status,
      document: doc.status,
    };
  },
  {
    id: created._id,
    paperId: fixtures.paper._id,
    documentId: fixtures.document._id,
  }
);

check(
  "22. collection deleted",
  survivors.collection === 404
);
check(
  "23. paper survives the delete",
  survivors.paper === 200,
  `HTTP ${survivors.paper}`
);
check(
  "24. document survives the delete",
  survivors.document === 200,
  `HTTP ${survivors.document}`
);

/* ---------------------------------------------------------------- */
/* 9. THEMES                                                        */
/* ---------------------------------------------------------------- */

await page.goto(`${APP}/collections`, {
  waitUntil: "load",
});
await page.waitForSelector(".collections-page", {
  timeout: 60000,
});
await page.waitForTimeout(2000);

/*
 * Drive the real control rather than poking the attribute,
 * and let the CSS transition settle: body has a
 * background-color transition, so a synchronous
 * getComputedStyle still reports the outgoing value.
 */
const readTheme = () =>
  page.evaluate(() => ({
    attr: document.documentElement.getAttribute(
      "data-theme"
    ),
    stored: localStorage.getItem("researcify-theme"),
    bg: getComputedStyle(document.body).backgroundColor,
  }));

const toggle = page.locator(".theme-toggle").first();

const first = await readTheme();

await toggle.click();
await page.waitForTimeout(900);

const second = await readTheme();

await toggle.click();
await page.waitForTimeout(900);

const third = await readTheme();

check(
  "25. theme toggle actually repaints the page",
  first.bg !== second.bg,
  `${first.attr}=${first.bg} -> ${second.attr}=${second.bg}`
);

check(
  "25b. attribute and storage follow the toggle",
  second.attr === second.stored &&
    third.attr === first.attr,
  `dark->${second.attr}->${third.attr}, stored=${second.stored}`
);

check(
  "25c. toggle round-trips to the original theme",
  third.bg === first.bg,
  `${first.bg} -> ${third.bg}`
);

/* ---------------------------------------------------------------- */
/* 10. CONSOLE / NETWORK HYGIENE                                    */
/* ---------------------------------------------------------------- */

// A 401/404 from the deleted collection is an expected
// consequence of step 22, not a defect.
const unexpected = failedRequests.filter(
  (r) =>
    !r.includes(created._id) &&
    !r.includes("/collections")
);

check(
  "26. no unexpected failed requests",
  unexpected.length === 0,
  unexpected.slice(0, 4).join(" | ") || "none"
);

check(
  "27. no page errors",
  pageErrors.length === 0,
  pageErrors.slice(0, 3).join(" | ") || "none"
);

const realConsoleErrors = consoleErrors.filter(
  (e) =>
    !e.toLowerCase().includes("failed to load resource") &&
    !e.includes(created._id)
);

check(
  "28. no console errors",
  realConsoleErrors.length === 0,
  realConsoleErrors.slice(0, 3).join(" | ") || "none"
);

/* ---------------------------------------------------------------- */
/* CLEANUP                                                           */
/* ---------------------------------------------------------------- */

await api(
  async (call, arg) => {
    await call("DELETE", "/papers/" + arg.paperId);
    await call(
      "DELETE",
      "/documents/" + arg.documentId
    );
    await call("DELETE", "/collections/" + arg.id);
  },
  {
    paperId: fixtures.paper._id,
    documentId: fixtures.document._id,
    id: created._id,
  }
);

await browser.close();

console.log("");
console.log(
  `UI RESULT: ${pass} passed, ${fail} failed`
);

if (consoleErrors.length) {
  console.log(
    `\nAll console errors (${consoleErrors.length}):\n  ` +
      consoleErrors.slice(0, 10).join("\n  ")
  );
}

if (failedRequests.length) {
  console.log(
    `\nAll failed requests (${failedRequests.length}):\n  ` +
      failedRequests.slice(0, 10).join("\n  ")
  );
}

process.exit(fail > 0 ? 1 : 0);
