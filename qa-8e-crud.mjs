import fs from "node:fs";

/*
 * Phase 8E.1 - 8E.4 Collections CRUD + lifecycle.
 *
 * Covers the matrix that a clean build cannot prove:
 * duplicate detection, case-insensitive uniqueness, search,
 * pin persistence, archive visibility across all three
 * archive modes, and deletion.
 *
 * Everything runs through the real API using the page's
 * authenticated fetch, so the assertions are about
 * behaviour rather than about the UI.
 */

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok.txt", "utf8")
  .trim();

const API = "http://localhost:5000/api/v1";

export default async function run(page) {
  const log = [];
  const say = (m) => log.push(m);

  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  const failed = [];
  page.on("requestfailed", (r) =>
    failed.push(`${r.failure()?.errorText} ${r.url()}`)
  );

  page.on("dialog", async (d) => {
    say(`        [confirm] "${d.message()}"`);
    await d.accept();
  });

  await page.goto("http://localhost:5173/", {
    waitUntil: "load",
  });
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, TOKEN);

  // ============ API CRUD MATRIX ============

  const results = await page.evaluate(async (api) => {
    const t = window.localStorage.getItem(
      "researcify_token"
    );
    const h = {
      Authorization: "Bearer " + t,
      "Content-Type": "application/json",
    };

    const call = async (method, path, body) => {
      const res = await fetch(api + path, {
        method,
        headers: h,
        body: body
          ? JSON.stringify(body)
          : undefined,
      });

      let json = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      return { status: res.status, body: json };
    };

    const out = {};

    const stamp = Date.now()
      .toString()
      .slice(-8);
    const name = `QA RAG ${stamp}`;

    // --- create ---
    const created = await call("POST", "/collections", {
      name,
      description: "QA lifecycle collection.",
    });
    out.create = created.status;
    out.createId = created.body?.data?._id;
    out.createCounts = {
      paper: created.body?.data?.paperCount,
      document: created.body?.data?.documentCount,
    };

    // --- duplicate same casing ---
    out.dupSame = (
      await call("POST", "/collections", {
        name,
        description: "duplicate",
      })
    ).status;

    // --- duplicate different casing ---
    out.dupCase = (
      await call("POST", "/collections", {
        name: name.toUpperCase(),
        description: "duplicate",
      })
    ).status;

    // --- missing name ---
    out.noName = (
      await call("POST", "/collections", {
        description: "no name here",
      })
    ).status;

    // --- list + search ---
    const list = await call(
      "GET",
      "/collections?archived=all"
    );
    out.list = list.status;
    out.listContains =
      list.body?.data?.some(
        (c) => c._id === out.createId
      ) ?? false;

    const search = await call(
      "GET",
      `/collections?search=${encodeURIComponent(name)}`
    );
    out.search = search.status;
    out.searchExact =
      search.body?.data?.length === 1 &&
      search.body?.data?.[0]?._id === out.createId;

    // --- update name + description ---
    const renamed = `${name} Renamed`;
    const updated = await call(
      "PATCH",
      `/collections/${out.createId}`,
      {
        name: renamed,
        description:
          "QA updated description.",
      }
    );
    out.update = updated.status;
    out.updateName = updated.body?.data?.name;
    out.updateDescription =
      updated.body?.data?.description;

    // --- rename onto an existing name is rejected ---
    const other = await call("POST", "/collections", {
      name: `${name} Other`,
    });
    out.otherId = other.body?.data?._id;
    out.dupRename = (
      await call(
        "PATCH",
        `/collections/${out.createId}`,
        { name: `${name} Other` }
      )
    ).status;

    // --- pin ---
    const pinned = await call(
      "PATCH",
      `/collections/${out.createId}/pin`
    );
    out.pin = pinned.status;
    out.isPinned = pinned.body?.data?.isPinned;

    const pinnedList = await call(
      "GET",
      "/collections?pinned=true&archived=all"
    );
    out.pinnedInList =
      pinnedList.body?.data?.some(
        (c) => c._id === out.createId
      ) ?? false;

    // --- archive hides from default view ---
    await call(
      "PATCH",
      `/collections/${out.createId}/archive`
    );

    const defaultList = await call("GET", "/collections");
    out.hiddenByDefault = !(
      defaultList.body?.data?.some(
        (c) => c._id === out.createId
      )
    );

    const archivedList = await call(
      "GET",
      "/collections?archived=true"
    );
    out.visibleArchived =
      archivedList.body?.data?.some(
        (c) => c._id === out.createId
      ) ?? false;

    const allList = await call(
      "GET",
      "/collections?archived=all"
    );
    out.visibleAll =
      allList.body?.data?.some(
        (c) => c._id === out.createId
      ) ?? false;

    // --- unarchive returns to default view ---
    await call(
      "PATCH",
      `/collections/${out.createId}/archive`
    );

    const backList = await call("GET", "/collections");
    out.visibleAfterUnarchive =
      backList.body?.data?.some(
        (c) => c._id === out.createId
      ) ?? false;

    // --- malformed id is a 404, not a 500 ---
    out.malformed = (
      await call("GET", "/collections/not-an-id")
    ).status;

    // --- delete ---
    out.delete =
      (
        await call(
          "DELETE",
          `/collections/${out.createId}`
        )
      ).status;

    out.goneAfterDelete = (
      await call("GET", `/collections/${out.createId}`)
    ).status;

    out.deleteAgain = (
      await call(
        "DELETE",
        `/collections/${out.createId}`
      )
    ).status;

    if (out.otherId) {
      await call(
        "DELETE",
        `/collections/${out.otherId}`
      );
    }

    return out;
  }, API);

  const checks = [
    ["create returns 201", results.create === 201, results.create],
    ["new collection counts are 0/0", results.createCounts.paper === 0 && results.createCounts.document === 0, JSON.stringify(results.createCounts)],
    ["duplicate same name -> 409", results.dupSame === 409, results.dupSame],
    ["duplicate different casing -> 409", results.dupCase === 409, results.dupCase],
    ["missing name -> 400", results.noName === 400, results.noName],
    ["list contains collection", results.listContains, results.list],
    ["search matches exactly one", results.searchExact, results.search],
    ["update name persists", results.update === 200 && results.updateName.endsWith("Renamed"), results.updateName],
    ["update description persists", results.updateDescription === "QA updated description.", results.updateDescription],
    ["rename onto existing name -> 409", results.dupRename === 409, results.dupRename],
    ["pin persists", results.pin === 200 && results.isPinned === true, results.isPinned],
    ["pinned filter includes it", results.pinnedInList, "-"],
    ["archive hides from default", results.hiddenByDefault, "-"],
    ["?archived=true shows it", results.visibleArchived, "-"],
    ["?archived=all shows it", results.visibleAll, "-"],
    ["unarchive restores default visibility", results.visibleAfterUnarchive, "-"],
    ["malformed id -> 404", results.malformed === 404, results.malformed],
    ["delete returns 200", results.delete === 200, results.delete],
    ["gone after delete -> 404", results.goneAfterDelete === 404, results.goneAfterDelete],
    ["delete again -> 404", results.deleteAgain === 404, results.deleteAgain],
  ];

  say("=== API CRUD MATRIX ===");
  checks.forEach(([name, ok, actual]) => {
    say(`${ok ? "PASS" : "FAIL"}  ${name}  (got ${actual})`);
  });

  // ============ LIVE UI WALKTHROUGH ============

  say("");
  say("=== LIVE UI ===");

  const ui = await page.evaluate(async (api) => {
    const t = window.localStorage.getItem(
      "researcify_token"
    );
    const res = await fetch(api + "/collections", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + t,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `QA UI ${Date.now().toString().slice(-6)}`,
        description: "Created for the UI walkthrough.",
      }),
    });

    return (await res.json()).data?._id;
  }, API);

  await page.goto("http://localhost:5173/collections", {
    waitUntil: "load",
  });
  await page.waitForSelector(".collections-page", {
    timeout: 60000,
  });
  await page.waitForTimeout(3000);

  const cards = await page.locator(".collection-card").count();
  say(`1. collections page renders ${cards} card(s)`);

  const stats = await page.evaluate(() =>
    [...document.querySelectorAll(".collection-stat")].map(
      (c) =>
        `${c.querySelector("p")?.innerText} = ${c.querySelector("strong")?.innerText}`
    )
  );
  stats.forEach((s) => say(`    stat: ${s}`));

  // Search narrows the grid.
  await page.locator(".collections-search input").fill("QA UI");
  await page.waitForTimeout(2000);
  const searched = await page.locator(".collection-card").count();
  say(`2. search "QA UI" -> ${searched} card(s)`);

  await page.locator(".collections-search input").fill("");
  await page.waitForTimeout(2000);

  // Pin through the card control.
  const firstPin = page.locator(".collection-pin").first();
  await firstPin.click();
  await page.waitForTimeout(2500);
  const pinnedActive = await page
    .locator(".collection-card .collection-pin.active")
    .count();
  say(`3. pinned cards after click: ${pinnedActive}`);

  // Pinned tab.
  await page
    .locator(".collections-tabs button", { hasText: "Pinned" })
    .click();
  await page.waitForTimeout(2000);
  const pinnedTab = await page.locator(".collection-card").count();
  say(`4. Pinned tab shows ${pinnedTab} card(s)`);

  // All tab.
  await page
    .locator(".collections-tabs button", { hasText: "All" })
    .click();
  await page.waitForTimeout(2000);

  // Open detail for the QA collection.
  await page.goto(
    `http://localhost:5173/collections/${ui}`,
    { waitUntil: "load" }
  );
  await page.waitForSelector(".collection-detail-header", {
    timeout: 60000,
  });
  await page.waitForTimeout(2500);

  const detailName = await page
    .locator(".collection-detail-title h1")
    .innerText();
  say(`5. detail page title: "${detailName.trim()}"`);

  const emptyShown = await page
    .locator(".collection-items-empty")
    .count();
  say(`6. empty state shown: ${emptyShown > 0} (expect true)`);

  const sectionButtons = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        ".collection-section__header h2"
      ),
    ].map((h) => h.innerText.trim())
  );
  say(`7. sections rendered: ${sectionButtons.join(" | ")}`);

  // Dark / light theme sanity.
  const themes = await page.evaluate(() => {
    const root = document.documentElement;
    const before = root.getAttribute("data-theme");

    root.setAttribute("data-theme", "light");
    const lightBg = getComputedStyle(
      document.body
    ).backgroundColor;

    root.setAttribute("data-theme", "dark");
    const darkBg = getComputedStyle(
      document.body
    ).backgroundColor;

    root.setAttribute("data-theme", before || "dark");

    return { lightBg, darkBg };
  });

  say(`8. theme backgrounds: light=${themes.lightBg} dark=${themes.darkBg}`);

  // Clean up the walkthrough collection.
  await page.evaluate(async ([api, id]) => {
    const t = window.localStorage.getItem(
      "researcify_token"
    );
    await fetch(api + "/collections/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + t },
    });
  }, [API, ui]);

  return {
    steps: log,
    consoleErrors,
    failedRequests: failed,
  };
}
