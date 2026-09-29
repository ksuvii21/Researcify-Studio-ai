import fs from "node:fs";

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

  const patches = [];
  page.on("response", (r) => {
    if (r.request().method() === "PATCH" && r.url().includes("/notes/")) {
      patches.push(r.status());
    }
  });

  page.on("dialog", async (d) => {
    say(`        [confirm] "${d.message()}"`);
    await d.accept();
  });

  // ============ SETUP: seed token, resolve real ids ============
  await page.goto("http://localhost:5173/", { waitUntil: "load" });
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, TOKEN);

  const setup = await page.evaluate(async (api) => {
    const t = window.localStorage.getItem("researcify_token");
    const h = { Authorization: "Bearer " + t };

    const papers = await (await fetch(api + "/papers", { headers: h })).json();
    const notes = await (
      await fetch(api + "/notes?archived=all", { headers: h })
    ).json();

    return {
      paperId: papers.data?.[0]?._id,
      paperTitle: papers.data?.[0]?.title,
      noteCount: notes.data?.length,
    };
  }, API);

  say(`0.  paper="${setup.paperTitle}" (${setup.paperId})`);

  // ============ 8C.5 PAPER NOTES ============
  const res = await page.goto(
    `http://localhost:5173/library/${setup.paperId}`,
    { waitUntil: "load" }
  );
  await page.waitForSelector(".paper-detail-header", { timeout: 60000 });
  await page.waitForTimeout(3000);

  say(`1/2. paper detail loaded (HTTP ${res.status()}), notes section=${(await page.locator(".paper-detail-notes").count()) > 0}`);
  const notesBefore = await page.locator(".paper-note").count();
  say(`2b. existing paper notes: ${notesBefore}`);

  // create note bound to this paper
  const stamp = Date.now().toString().slice(-6);
  const noteTitle = `Attention observations ${stamp}`;

  await page.getByRole("button", { name: /add note/i }).first().click();
  await page.waitForSelector(".app-modal", { timeout: 30000 });
  await page.waitForTimeout(800);

  say(`3.  paper picker hidden: ${(await page.locator("#note-form-paper").count()) === 0} (expect true)`);

  await page.locator("#note-form-title").fill(noteTitle);
  await page
    .locator("#note-form-content")
    .fill("Multi-head attention lets the model attend to information jointly.");
  await page.getByRole("button", { name: /create note/i }).last().click();
  await page.waitForTimeout(3500);

  say(`4.  paper notes now: ${await page.locator(".paper-note").count()}`);

  const bound = await page.evaluate(
    async ([api, title]) => {
      const t = window.localStorage.getItem("researcify_token");
      const r = await fetch(
        api + "/notes?search=" + encodeURIComponent(title),
        { headers: { Authorization: "Bearer " + t } }
      );
      const j = await r.json();
      const n = j.data?.[0];
      return { id: n?._id, paperBound: !!n?.paperId, paperTitle: n?.paperId?.title };
    },
    [API, noteTitle]
  );
  say(`5.  paperId auto-bound: ${bound.paperBound} -> "${bound.paperTitle}"`);

  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".paper-note", { timeout: 60000 });
  await page.waitForTimeout(2000);
  say(`6.  after refresh: ${await page.locator(".paper-note").count()} note(s)`);

  // pin
  await page.locator(".paper-note__actions button").nth(1).click();
  await page.waitForTimeout(2500);
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".paper-note", { timeout: 60000 });
  await page.waitForTimeout(2000);
  say(`7/8. pin persisted: ${(await page.locator(".paper-note__actions button.active").count()) > 0}`);

  // ============ 8C.6 EDITOR + AUTOSAVE ============
  await page.goto(`http://localhost:5173/notes/${bound.id}`, {
    waitUntil: "load",
  });
  await page.waitForSelector(".note-workspace", { timeout: 60000 });
  await page.waitForTimeout(2500);

  const status = () => page.locator(".note-save-status").innerText();
  const titleInput = page.locator(".note-title-input");

  say(`9/10. editor at ${page.url().replace("http://localhost:5173", "")}`);
  say(`11. initial status: "${await status()}"`);

  await titleInput.click();
  await titleInput.press("End");
  await page.keyboard.type(" revised", { delay: 60 });
  await page.waitForTimeout(300);
  say(`12. after typing: "${await status()}" (expect Unsaved changes)`);

  await page.waitForTimeout(800);
  say(`13/14. mid-flight: "${await status()}"`);

  await page.waitForTimeout(3000);
  say(`15. settled: "${await status()}" (expect Saved); PATCHes=${patches.length}`);

  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".note-workspace", { timeout: 60000 });
  await page.waitForTimeout(2500);
  say(`16/17. title after refresh: "${await titleInput.inputValue()}"`);

  // rapid edits
  const area = page.locator(".note-editor__content");
  for (let i = 1; i <= 6; i += 1) {
    await area.click();
    await area.press("Control+a");
    await page.keyboard.type(`Rapid revision ${i}`, { delay: 12 });
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(4500);
  say(`18/19/20. after 6 rapid edits: "${await status()}"`);

  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".note-workspace", { timeout: 60000 });
  await page.waitForTimeout(2500);
  say(`20b. persisted content: "${await area.inputValue()}"`);

  // edit during in-flight save
  await area.click();
  await area.press("Control+a");
  await page.keyboard.type("Edit during save A", { delay: 12 });
  await page.waitForTimeout(1100);
  await area.click();
  await area.press("Control+a");
  await page.keyboard.type("Edit during save B", { delay: 12 });
  await page.waitForTimeout(800);
  say(`21/22. status during race: "${await status()}"`);

  await page.waitForTimeout(4500);
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".note-workspace", { timeout: 60000 });
  await page.waitForTimeout(2500);
  say(`23. final revision: "${await area.inputValue()}" (expect "Edit during save B")`);

  // ============ 27-31 NAVIGATION ============
  await page.goto("http://localhost:5173/notes", { waitUntil: "load" });
  await page.waitForSelector(".note-card", { timeout: 60000 });
  await page.waitForTimeout(2000);
  await page
    .locator(".note-card")
    .filter({ hasText: noteTitle })
    .first()
    .locator("footer button")
    .click();
  await page.waitForSelector(".note-workspace", { timeout: 60000 });
  await page.waitForTimeout(1500);
  say(`31. workspace Open Note -> ${page.url().replace("http://localhost:5173", "")}`);

  await page.goto("http://localhost:5173/projects", { waitUntil: "load" });
  await page.waitForSelector(".project-card", { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.locator(".project-card__footer button").first().click();
  await page.waitForSelector(".project-tabs", { timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: /^notes$/i }).click();
  await page.waitForTimeout(2500);
  const projNotes = await page.locator(".project-note-card").count();
  say(`28. project Notes tab: ${projNotes} note(s)`);

  if (projNotes > 0) {
    await page.locator(".project-note-card__actions button").first().click();
    await page.waitForSelector(".note-workspace", { timeout: 60000 });
    await page.waitForTimeout(1200);
    say(`29/30. project note -> ${page.url().replace("http://localhost:5173", "")}`);
  }

  // ============ 32-35 DASHBOARD ============
  await page.goto("http://localhost:5173/dashboard", { waitUntil: "load" });
  await page.waitForSelector(".dashboard-home", { timeout: 60000 });
  await page.waitForTimeout(4000);

  const dash = await page.evaluate(() =>
    [...document.querySelectorAll(".overview-card")].map(
      (c) =>
        `${c.querySelector(".overview-card__label")?.innerText} = ${c
          .querySelector(".overview-card__value")
          ?.innerText} (${c.querySelector("small")?.innerText})`
    )
  );
  say("32/35. dashboard:");
  dash.forEach((s) => say(`        ${s}`));

  const backendTotal = await page.evaluate(async (api) => {
    const t = window.localStorage.getItem("researcify_token");
    const r = await fetch(api + "/notes?archived=all", {
      headers: { Authorization: "Bearer " + t },
    });
    return (await r.json()).data.length;
  }, API);
  say(`32b. backend total notes = ${backendTotal}`);

  return {
    steps: log,
    consoleErrors,
    failedRequests: failed,
    totalPatches: patches.length,
    noteId: bound.id,
  };
}